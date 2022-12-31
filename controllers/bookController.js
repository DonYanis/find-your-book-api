const catchAsyncErrors = require('../utils/catchAsyncErrors');
const driver = require('../neo4j');
const AppError = require('../utils/appError');

exports.getAllBooks = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    try {
        const result = await session.executeRead(tx =>
            tx.run(
            'MATCH (b:Book) RETURN b;'
            )
        );
        let books=[];
        result.records.forEach(e => {
            books.push(e._fields[0].properties);
        });
        res.status(200).json({
            status:'success',
            result: books.length,
            data : {
                books
            }
        });
    }
    catch (e) {
    return next(new AppError('Internal server error',500))
    }
    finally {
        await session.close()
    }  
});

exports.getBookByISBN = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let isbn = req.params.isbn;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(b:Book) WHERE b.isbn = '${isbn}' RETURN b;`
            )

        );
        if(result.records.length===0){
            return next(new AppError('No book found with that isbn',404))
        }

        let book = result.records[0]._fields[0].properties;

        let authors = await session.executeRead(tx =>
            tx.run(
                `MATCH (b:Book)<-[w:HAS_WRITTEN]-(a:Author)
                 WHERE b.isbn = '${isbn}' 
                 RETURN a,w;`
            )
        );
        let book_authors = [];
        authors.records.forEach(e => {
            book_authors.push({ "author" : e._fields[0].properties,
                  "has_written" : e._fields[1].properties
                })
        });

        let Genres = await session.executeRead(tx =>
            tx.run(
                `MATCH (b:Book)-[:SPEAK_ABOUT]->(g:Genre) 
                 WHERE b.isbn = '${isbn}' 
                 RETURN g;`
            )
        );
        let book_Genres=[];
        Genres.records.forEach(e=>{
            book_Genres.push(e._fields[0].properties.name)
        });

        let book_Pub = await session.executeRead(tx =>
            tx.run(
                `MATCH (b:Book)<-[pb:HAS_PUBLISHED]-(p:Publisher) 
                 WHERE b.isbn = '${isbn}' 
                 RETURN p,pb;`
            )
        );
        let publisher = {"name" : book_Pub.records[0]._fields[0].properties.name,
                        "date" : book_Pub.records[0]._fields[1].properties.date }
        res.status(200).json({
            status:'success',
            result: result.records.length,
            data : {
                book,
                book_Genres,
                book_authors,
                publisher
            }
        });
    }
    catch (e) {
    return next(new AppError('Internal server error',500))
    }
    finally {
        await session.close()
    }  
});

exports.searchBooks = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let phrase = req.body.phrase.replace(/[|&\.;<>()#=+-:\*~'@,]/g,"").toLowerCase().split(' ');
    
    try {

        let words = "[";
        phrase.forEach((e,i)=>{
            if(i===phrase.length-1){
                words=words+`"${e}"]`;
            }else{
                words=words+`"${e}",`;
            }  
        });
        const result = await session.executeRead(tx =>
            tx.run(
                `UNWIND ${words} as word
                 MATCH (a:Author)-[:HAS_WRITTEN]->(b:Book)-[:SPEAK_ABOUT]->(g:Genre) 
                 WHERE 
                    toLower(b.title) CONTAINS word OR 
                    toLower(g.name) CONTAINS word  OR 
                    toLower(a.name) CONTAINS word 
                 WITH b AS book, g AS genre,a AS author, COUNT(word) AS nb
                 WITH collect({book:book, genre:genre,author:author, nb:nb}) AS a
                 UNWIND a AS  c RETURN DISTINCT c.book.isbn,c.book.title,c.book.ratings_average , c.nb ORDER BY c.nb DESC;`
            )

        );

        let books=[];
        let isbns=[]
        result.records.forEach(e => {
            if(!isbns.includes(e._fields[0])){
                books.push([e._fields[0],e._fields[1],e._fields[2].low]);
                isbns.push(e._fields[0]);
            }
        });
        res.status(200).json({
            status:'success',
            result: books.length,
            data : {
                books
            }
        });
    }
    catch (e) {
    return next(new AppError('Internal server error',500))
    }
    finally {
        await session.close()
    }  
});

exports.getBookReviews = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let isbn = req.params.isbn;
    console.log(isbn)
    try {

        let result = await session.executeRead(tx =>
            tx.run(
                `MATCH (book:Book)<-[r:HAS_READ]-(reader:Reader)
                 WHERE book.isbn = '${isbn}' 
                 RETURN reader.first_name, reader.last_name,r.rating,r.review;`
            )
        );
        let views =[];
        result.records.forEach(e=>{
            views.push(e._fields)
        });

        res.status(200).json({
            status:'success',
            result: views.length,
            data : {
                views
            }
        });
    }
    catch (e) {
    return next(new AppError('Internal server error',500))
    }
    finally {
        await session.close()
    }  
});

exports.addBook = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(b:Book) WHERE b.isbn = '${req.body.isbn}' RETURN b;`
            )

        );
        if(result.records.length>=1){
            return next(new AppError('book already exists',403))
        } 
        
        const add = await session.executeWrite(tx =>
            tx.run(
                `CREATE (b:Book{isbn:"${req.body.isbn}", title:"${req.body.title}", 
                 description:"${req.body.description}", page_count:${req.body.page_count}, 
                 ratings_average :0,ratings_count: 0, readings_count: 0})`
            )

        );
            
        let genres = "[";
        req.body.book_Genres.forEach((e,i)=>{
            if(i===req.body.book_Genres.length-1){
                genres=genres+`"${e}"]`;
            }else{
                genres=genres+`"${e}",`;
            }  
        })

        let query="" ;

        req.body.book_authors.forEach((e,i)=>{
            query=query+` MERGE (a${i}:Author{key:"${e.author.key}", name:"${e.author.name}"})
             MERGE (a${i})-[:HAS_WRITTEN{date:"${e.has_written.date}"}]->(b)`
        });

        const addAPG = await session.executeWrite(tx =>
            tx.run(
                `UNWIND ${genres} as genre 
                 MATCH (b:Book{isbn:"${req.body.isbn}"}) 
                
                 MERGE (g:Genre{name:genre}) 
                 MERGE (b)-[:SPEAK_ABOUT]->(g)

                 MERGE (p:Publisher{name:"${req.body.publisher.name}"})
                 MERGE (b)<-[:HAS_PUBLISHED{date:"${req.body.publisher.date}"}]-(p)
                 
                 ${query}`
            )
        );
        
        res.status(200).json({
            status:'success',
            result: 1,
        });
    }
    catch (e) {
    return next(new AppError('Internal server error',500))
    }
    finally {
        await session.close()
    }  
});

exports.deleteBook = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let isbn = req.body.isbn;

    try {
        const result = await session.executeWrite(tx =>
            tx.run(
                `MATCH (b:Book)
                 WHERE b.isbn = "${isbn}" 
                 DETACH DELETE b;`
            )

        );        

        res.status(200).json({
            status:'success',
            result: 1,
        });
    }
    catch (e) {
    return next(new AppError('Internal server error',500))
    }
    finally {
        await session.close()
    }  
});