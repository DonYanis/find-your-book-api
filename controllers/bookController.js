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
            books.push(e._fields[0]);
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
    console.log(e)
    }
    finally {
        await session.close()
    }  
});


exports.getBookByISBN = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let isbn = req.params.isbn;
    console.log(isbn)
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
    console.log(e)
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
    console.log(e)
    }
    finally {
        await session.close()
    }  
});