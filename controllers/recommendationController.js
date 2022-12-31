const catchAsyncErrors = require('../utils/catchAsyncErrors');
const driver = require('../neo4j');
const AppError = require('../utils/appError');


exports.getGlobalRec = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    const id = req.params.id
    const viewMore = req.body.viewMore | 0; //each view more is +1 (init is 0)
    const limit = 7;
    try {
        
        const book = await session.executeRead(tx =>
            tx.run(`
            MATCH(r) WHERE ID(r) = ${id}
            OPTIONAL MATCH (b1:Book)<-[:HAS_WRITTEN]-(:Author)<-[:FAN_OF]-(r)
            OPTIONAL MATCH (b2:Book)<-[:LIKE]-(:Reader)<-[:FOLLOWS]-(r)
            OPTIONAL MATCH (b3:Book)<-[:LIKE]-(:Reader)<-[:FOLLOWS]-(:Reader)<-[:FOLLOWS]-(r) 
            OPTIONAL MATCH (r)-[:LIKE]->(:Book)<-[:LIKE]-(:Reader)-[:LIKE]->(b4:Book)
            OPTIONAL MATCH (r)-[:LIKE]->(:Book)-[:SPEAK_ABOUT]->(:Genre)<-[:SPEAK_ABOUT]-(b5:Book) 
            OPTIONAL MATCH (r)-[:LIKE]->(:Book)<-[:HAS_PUBLISHED]-(:Publisher)-[:HAS_PUBLISHED]->(b6:Book)
            OPTIONAL MATCH (r)-[:VISITED]->(:Book)-[:SPEAK_ABOUT]->(:Genre)<-[:SPEAK_ABOUT]-(b7:Book)
            OPTIONAL MATCH (r)-[:FOLLOWS]->(:Reader)-[:VISITED]->(b8:Book)
            OPTIONAL MATCH (r)-[:WANT_READ]->(:Book)-[:SPEAK_ABOUT]->(:Genre)<-[:SPEAK_ABOUT]-(b9:Book)
            OPTIONAL MATCH (b10:Book)<-[:VISITED]-(:Reader)<-[:FOLLOWS]-(fr:Reader)<-[:FOLLOWS]-(r)-[:VISITED]->(b10)<-[:VISITED]-(fr) 
            
            WHERE NOT (r)-[:HAS_READ]->(b1) AND NOT (r)-[:HAS_READ]->(b2) AND NOT (r)-[:HAS_READ]->(b3) 
            AND NOT (r)-[:HAS_READ]->(b4) AND NOT (r)-[:HAS_READ]->(b5) AND NOT (r)-[:HAS_READ]->(b6)
            AND NOT (r)-[:HAS_READ]->(b7) AND NOT (r)-[:HAS_READ]->(b8) AND NOT (r)-[:HAS_READ]->(b9)
            AND NOT (r)-[:HAS_READ]->(b10)
            
            WITH
             COLLECT({book:b1, points: 5}) + COLLECT({book:b2, points: 4}) + COLLECT({book:b3, points: 1}) +
             COLLECT({book:b4, points: 3}) + COLLECT({book:b5, points: 2}) + COLLECT({book:b6, points: 1}) +
             COLLECT({book:b7, points: 2}) + COLLECT({book:b8, points: 1}) + COLLECT({book:b9, points: 3}) +
             COLLECT({book:b10, points: 2})
             
            AS total UNWIND total AS list
            
            RETURN  list.book.isbn,list.book.title,list.book.ratings_average, sum(distinct list.points) AS points 
            ORDER BY points DESC SKIP ${viewMore*limit} LIMIT ${limit};`)
        );

        let books = [];
        book.records.forEach(e=>{
            if(e._fields[0]!=null)
            books.push([e._fields[0],e._fields[1],e._fields[2].low]);
        });    
        if(books.length-6<0){
            const book2 = await session.executeRead(tx =>
                tx.run(
                    `MATCH(r:Reader),(b:Book)
                     WHERE ID(r)=${id}
                     AND NOT (r)-[:HAS_READ]->(b)
                     AND NOT (r)-[:WANT_READ]-(b)
                     RETURN DISTINCT b.isbn, b.title, b.ratings_average
                     ORDER BY b.ratings_average DESC SKIP ${viewMore * 6} LIMIT 6 ;`)
            );

            book2.records.forEach(e=>{
                if(e._fields[0]!=null)
                books.push([e._fields[0],e._fields[1],e._fields[2].low]);
            });
        } 

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
        return next(new AppError('Internal server error',500))
    }
    finally {
        await session.close()
    }  
});

exports.getReaderTastes = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    const id = req.params.id;
    const viewMore = req.body.viewMore | 0;
    try {
        const book = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[:HAS_READ_GENRE]->(g:Genre)<-[:SPEAK_ABOUT]-(b:Book)
                 WHERE ID(r)=${id}
                 AND NOT (r)-[:HAS_READ]->(b)
                 AND NOT (r)-[:WANT_READ]-(b)
                 RETURN DISTINCT b.isbn, b.title, b.ratings_average
                 ORDER BY b.ratings_average DESC SKIP ${viewMore*6} LIMIT 6 ;`)
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
    const viewMore = req.body.viewMore | 0;
    try {
        const readbook = await session.executeRead(tx =>
            tx.run(
                `MATCH (r:Reader) WHERE ID(r)=${id}
                 MATCH (r)-[:FOLLOWS]->(f:Reader)-[:HAS_READ]->(b:Book)
                 WHERE NOT (r)-[:HAS_READ]->(b)
                 AND NOT (r)-[:WANT_READ]-(b)
                 RETURN DISTINCT b.isbn,b.title,b.ratings_average 
                 ORDER BY b.ratings_average DESC SKIP ${viewMore * 6} LIMIT 6
                 UNION
                 MATCH (r)-[:FOLLOWS]->(f:Reader)-[:WANT_READ]->(b:Book)
                 WHERE NOT (r)-[:HAS_READ]->(b)
                 AND NOT (r)-[:WANT_READ]-(b)
                 RETURN DISTINCT b.isbn,b.title,b.ratings_average 
                 ORDER BY b.ratings_average DESC SKIP ${viewMore * 6} LIMIT 6;`)
        );

        let books = [];
        readbook.records.forEach(e=>{
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

exports.getReaderAuthors = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    const id = req.params.id;
    const viewMore = req.body.viewMore | 0;

    try {
        const book = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[:FAN_OF]->(a:Author)-[:HAS_WRITTEN]->(b:Book)
                 WHERE ID(r)=${id}
                 AND NOT (r)-[:HAS_READ]->(b)
                 AND NOT (r)-[:WANT_READ]-(b)
                 RETURN DISTINCT b.isbn, b.title, b.ratings_average
                 ORDER BY b.ratings_average DESC SKIP ${viewMore * 6} LIMIT 6;`)
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
        const similarbooks = await session.executeRead(tx =>
            tx.run(
                `MATCH (book:Book) <-[:HAS_WRITTEN]-(a:Author)-[:HAS_WRITTEN]->(b:Book)
                 WHERE book.isbn="${isbn}"
                 RETURN DISTINCT b.isbn,b.title,b.ratings_average 
                 ORDER BY b.ratings_average DESC
                 LIMIT 6
                 UNION
                 MATCH(book:Book)-[:SPEAK_ABOUT]->(g:Genre)<-[:SPEAK_ABOUT]-(b:Book) 
                 WHERE book.isbn="${isbn}"
                 RETURN DISTINCT b.isbn,b.title,b.ratings_average 
                 ORDER BY b.ratings_average DESC
                 LIMIT 6`)
        );

        let books = [];
        similarbooks.records.forEach(e=>{
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
                 LIMIT 8;`)
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