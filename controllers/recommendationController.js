const catchAsyncErrors = require('../utils/catchAsyncErrors');
const driver = require('../neo4j');
const AppError = require('../utils/appError');


exports.getGlobalRec = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    const id = req.params.id;
    
    try {
        const book = await session.executeRead(tx =>
            tx.run(`MATCH (b:Book) RETURN b.isbn,b.title,a.name,b.ratings_average;`)
        );

        let books = [];
        book.records.forEach(e=>{
            books.push([e._fields[0],e._fields[1],e._fields[2].low]);
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

exports.getReaderTastes = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    const id = req.params.id;
    
    try {
        const book = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[:HAS_READ_GENRE]->(g:Genre)<-[:SPEAK_ABOUT]-(b:Book)
                 WHERE ID(r)=${id}
                 AND NOT (r)-[:HAS_READ]->(b)
                 AND NOT (r)-[:WANT_READ]-(b)
                 RETURN DISTINCT b.isbn, b.title, b.ratings_average
                 ORDER BY b.ratings_average DESC;`)
        );

        let books = [];
        book.records.forEach(e=>{
            books.push([e._fields[0],e._fields[1],e._fields[2].low]);
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

exports.getFriendTastes = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    const id = req.params.id;
    
    try {
        const readbook = await session.executeRead(tx =>
            tx.run(
                `MATCH (r:Reader)-[:FOLLOWS]->(f)-[:HAS_READ]->(b:Book)
                 WHERE ID(r)=${id}
                 AND NOT (r)-[:HAS_READ]->(b)
                 AND NOT (r)-[:WANT_READ]-(b)
                 RETURN DISTINCT b.isbn,b.title,b.ratings_average 
                 ORDER BY b.ratings_average DESC;`)
        );

        const wantedbook = await session.executeRead(tx =>
            tx.run(
                `MATCH (r:Reader)-[:FOLLOWS]->(f)-[:WANT_READ]->(b:Book)
                 WHERE ID(r)=${id}
                 AND NOT (r)-[:HAS_READ]->(b)
                 AND NOT (r)-[:WANT_READ]-(b)
                 RETURN DISTINCT b.isbn,b.title,b.ratings_average 
                 ORDER BY b.ratings_average DESC;
                `)
        );

        let books = [];
        let isbns=[];
        readbook.records.forEach(e=>{
            books.push([e._fields[0],e._fields[1],e._fields[2].low]);
            isbns.push(e._fields[0]);
        });  
        wantedbook.records.forEach(e=>{
            let b = [e._fields[0],e._fields[1],e._fields[2].low]
            if(!isbns.includes(b[0]))
            books.push(b);
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

exports.getReaderAuthors = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    const id = req.params.id;
    
    try {
        const book = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[:FAN_OF]->(a:Author)-[:HAS_WRITTEN]->(b:Book)
                 WHERE ID(r)=${id}
                 AND NOT (r)-[:HAS_READ]->(b)
                 AND NOT (r)-[:WANT_READ]-(b)
                 RETURN DISTINCT b.isbn, b.title, b.ratings_average
                 ORDER BY b.ratings_average DESC;`)
        );

        let books = [];
        book.records.forEach(e=>{
            books.push([e._fields[0],e._fields[1],e._fields[2].low]);
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

exports.getSimilarBooks = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    const isbn = req.params.isbn;
    
    try {
        const wrotebook = await session.executeRead(tx =>
            tx.run(
                `MATCH (book:Book) <-[:HAS_WRITTEN]-(a:Author)-[:HAS_WRITTEN]->(b:Book)
                 WHERE book.isbn="${isbn}"
                 RETURN DISTINCT b.isbn,b.title,b.ratings_average 
                 ORDER BY b.ratings_average DESC
                 LIMIT 6;`)
        );

        const relatedbook = await session.executeRead(tx =>
            tx.run(
                `MATCH(book:Book)-[:SPEAK_ABOUT]->(g:Genre)<-[:SPEAK_ABOUT]-(b:Book) 
                 WHERE book.isbn="${isbn}"
                 RETURN DISTINCT b.isbn,b.title,b.ratings_average 
                 ORDER BY b.ratings_average DESC
                 LIMIT 6;`)
        );

        let books = [];
        let isbns=[];
        wrotebook.records.forEach(e=>{
            books.push([e._fields[0],e._fields[1],e._fields[2].low]);
            isbns.push(e._fields[0]);
        });  
        relatedbook.records.forEach(e=>{
            let b = [e._fields[0],e._fields[1],e._fields[2].low]
            if(!isbns.includes(b[0]))
            books.push(b);
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

exports.getReadersBooks = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    const isbn = req.params.isbn;
    
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH (book:Book)<-[:HAS_READ]-(r:Reader)-[:HAS_READ]-> (b:Book) 
                 WHERE book.isbn="${isbn}"
                 RETURN DISTINCT b.isbn,b.title,b.ratings_average 
                 ORDER BY b.ratings_average DESC
                 LIMIT 6;`)
        );

        let books = [];
        result.records.forEach(e=>{
            books.push([e._fields[0],e._fields[1],e._fields[2].low]);

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