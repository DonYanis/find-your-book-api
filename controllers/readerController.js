const catchAsyncErrors = require('../utils/catchAsyncErrors');
const driver = require('../neo4j');
const AppError = require('../utils/appError');


exports.getAllReaders = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    try {
        const result = await session.executeRead(tx =>
            tx.run(
            'MATCH (r:Reader) RETURN r;'
            )
        );
        let readers=[];
        result.records.forEach(e => {
            readers.push({  "id": e._fields[0].identity.low,
                            "properties" : e._fields[0].properties});
        });
        res.status(200).json({
            status:'success',
            result: readers.length,
            data : {
                readers
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

exports.getreaderById = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader) WHERE ID(r) = ${id} RETURN r;`
            )

        );
        if(result.records.length===0){
            return next(new AppError('No reader found with that id',404))
        }

        let reader = 
            {   "id": result.records[0]._fields[0].identity.low,
                "properties" : result.records[0]._fields[0].properties
            };

        res.status(200).json({
            status:'success',
            result: result.records.length,
            data : {
                reader
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

exports.getreaderByEmail = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let email = req.params.email;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader) WHERE r.email = '${email}' RETURN r;`
            )

        );
        if(result.records.length===0){
            return next(new AppError('No reader found with that id',404))
        }

        let reader = 
        {   "id": result.records[0]._fields[0].identity.low,
            "properties" : result.records[0]._fields[0].properties
        };
        res.status(200).json({
            status:'success',
            result: result.records.length,
            data : {
                reader
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

exports.getreadBooks = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:HAS_READ]->(b:Book)
                 WHERE ID(r) = ${id} RETURN b.isbn,b.title,rel.rating, rel.review, rel.date;`
            )

        );
        let books = [];
        result.records.forEach(e=>{
            books.push({
                "isbn" :e._fields[0] ,
                "title" : e._fields[1] ,
                "rating" :e._fields[2].low,
                "review" :e._fields[3],
                "date" :new Date(e._fields[4].low)   
            });
           
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

exports.getwantBooks = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:WANT_READ]->(b:Book)
                 WHERE ID(r) = ${id} RETURN b.isbn,b.title,rel.date;`
            )

        );
        let books = [];
        result.records.forEach(e=>{
            books.push({
                "isbn" :e._fields[0] ,
                "title" : e._fields[1] ,
                "date" :new Date(e._fields[2].low)   
            });
           
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

exports.getvisitedBooks = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:VISITED]->(b:Book)
                 WHERE ID(r) = ${id} RETURN b.isbn,b.title,rel.date;`
            )

        );
        let books = [];
        result.records.forEach(e=>{
            books.push({
                "isbn" :e._fields[0] ,
                "title" : e._fields[1] ,
                "date" :new Date(e._fields[2].low)   
            });
           
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

exports.getlikedBooks = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:LIKE]->(b:Book)
                 WHERE ID(r) = ${id} RETURN b.isbn,b.title;`
            )

        );
        let books = [];
        result.records.forEach(e=>{
            books.push({
                "isbn" :e._fields[0] ,
                "title" : e._fields[1]   
            });
           
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

exports.getreaderGenres = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:HAS_READ_GENRE]->(g:Genre)
                 WHERE ID(r) = ${id} RETURN g.name,rel.reading_count ORDER BY rel.reading_count DESC;`
            )

        );
        let genres = [];
        result.records.forEach(e=>{
            genres.push({
                "name" :e._fields[0],
                "count" :e._fields[1].low  
            });
           
        });

        res.status(200).json({
            status:'success',
            result: genres.length,
            data : {
                genres
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

exports.getreaderFriends = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[:FOLLOWS]->(r2:Reader)
                 WHERE ID(r) = ${id} RETURN ID(r2),r2.first_name,r2.last_name,r2.email;`
            )

        );
        let friends = [];
        result.records.forEach(e=>{
            friends.push({
                "id" :e._fields[0].low,
                "first_name" :e._fields[1] ,
                "last_name" :e._fields[2],
                "email" :e._fields[3]
            });
           
        });

        res.status(200).json({
            status:'success',
            result: friends.length,
            data : {
                friends
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

exports.getreaderAuthors = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[:FAN_OF]->(a:Author)
                 WHERE ID(r) = ${id} RETURN a.key, a.name;`
            )

        );
        let authors = [];
        result.records.forEach(e=>{
            authors.push({
                "key" :e._fields[0] ,
                "name" :e._fields[1]
            });
           
        });

        res.status(200).json({
            status:'success',
            result: authors.length,
            data : {
                authors
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

exports.setreadBook = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    let isbn = req.body.isbn;
    let rating = req.body.rating;
    let review = req.body.review;

    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:HAS_READ]->(b:Book)
                 WHERE ID(r) = ${id} AND b.isbn = '${isbn}' RETURN rel;`
            )

        );

        if(result.records.length >= 1 ){
            return next(new AppError('Book already read',500))
        }
        if(rating>=0){
            const create = await session.executeWrite(tx =>
                tx.run(
                    `MATCH(r:Reader),(b:Book)
                     WHERE ID(r) = ${id} AND b.isbn = "${isbn}" 
                     CREATE (r)-[:HAS_READ {rating : ${rating}, review :"${review}", date:${Date.now()}}]->(b)
                     SET b.readings_count = b.readings_count+1, 
                     b.ratings_count = b.ratings_count + 1, 
                     b.ratings_average = (((b.ratings_average * b.ratings_count) + ${rating} ) /(b.ratings_count+1))`
                )
            );
            
                         
    
            if(rating>=3){
                const like = await session.executeWrite(tx =>
                    tx.run(
                        `MATCH(r:Reader),(b:Book)
                         WHERE ID(r) = ${id} AND b.isbn = '${isbn}' 
                         MERGE (r)-[:LIKE]->(b)`
                    )
                );
            }
        }else{
            const create = await session.executeWrite(tx =>
                tx.run(
                    `MATCH(r:Reader),(b:Book)
                     WHERE ID(r) = ${id} AND b.isbn = "${isbn}" 
                     CREATE (r)-[:HAS_READ {rating : 0, review :"", date:${Date.now()}}]->(b)
                     SET b.readings_count = b.readings_count+1`
                )
            );
        }

        const createGenresRel = await session.executeWrite(tx =>
            tx.run(
                    `MATCH (r:Reader),(b:Book{isbn: "${isbn}"})-[SPEAK_ABOUT]->(g:Genre)
                     WHERE ID(r) = ${id}
                     MERGE (r)-[re:HAS_READ_GENRE]->(g)
                     ON CREATE SET re.reading_count = 1
                     ON MATCH SET re.reading_count = re.reading_count + 1`
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

exports.deletereadBook = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    let isbn = req.body.isbn;

    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:HAS_READ]->(b:Book)
                 WHERE ID(r) = ${id} AND b.isbn = '${isbn}' RETURN rel;`
            )

        );

        if(result.records.length ===0 ){
            return next(new AppError('Book not in read list',500))
        }

        const remove = await session.executeWrite(tx =>
            tx.run(
                `MATCH(r:Reader)-[re:HAS_READ]->(b:Book)
                    WHERE ID(r) = ${id} AND b.isbn = "${isbn}" 
                    DELETE re
                    SET b.readings_count = b.readings_count-1`
            )
        );
    

        const removeLike = await session.executeWrite(tx =>
            tx.run(
                `MATCH(r:Reader)-[re:LIKE]->(b:Book)
                    WHERE ID(r) = ${id} AND b.isbn = '${isbn}' 
                    DELETE re`
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

exports.setwantBook = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    let isbn = req.body.isbn;

    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:WANT_READ]->(b:Book)
                 WHERE ID(r) = ${id} AND b.isbn = '${isbn}' RETURN rel;`
            )

        );

        if(result.records.length >= 1 ){
            return next(new AppError('Book already exists',403))
        }

        const create = await session.executeWrite(tx =>
            tx.run(
                `MATCH(r:Reader),(b:Book)
                    WHERE ID(r) = ${id} AND b.isbn = "${isbn}" 
                    CREATE (r)-[:WANT_READ {date:${Date.now()}}]->(b);`
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

exports.deletewantBook = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    let isbn = req.body.isbn;

    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader)-[rel:WANT_READ]->(b:Book)
                 WHERE ID(r) = ${id} AND b.isbn = '${isbn}' RETURN rel;`
            )

        );

        if(result.records.length ===0 ){
            return next(new AppError('Book not in want list',500))
        }

        const remove = await session.executeWrite(tx =>
            tx.run(
                `MATCH(r:Reader)-[re:WANT_READ]->(b:Book)
                    WHERE ID(r) = ${id} AND b.isbn = "${isbn}" 
                    DELETE re`
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

exports.setvisitedBook = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    let isbn = req.body.isbn;

    try {
        const result = await session.executeWrite(tx =>
            tx.run(
                `MATCH (r:Reader),(b:Book)
                 WHERE ID(r) = ${id} AND b.isbn = '${isbn}' 
                 MERGE (r)-[v:VISITED]->(b)
                 SET v.date=${Date.now()};`
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

exports.deletelikedBook = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    let isbn = req.body.isbn;

    try {
        const result = await session.executeWrite(tx =>
            tx.run(
                `MATCH (r:Reader)-[l:LIKE]->(b:Book)
                 WHERE ID(r) = ${id} AND b.isbn = '${isbn}' 
                 DELETE l;`
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

exports.setreaderFriend = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    let friend = req.body.id;

    try {
        const result = await session.executeWrite(tx =>
            tx.run(
                `MATCH (r:Reader),(r2:Reader)
                 WHERE ID(r) = ${id} AND ID(r2) = ${friend} 
                 MERGE (r)-[:FOLLOWS]->(r2);`
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

exports.deletereaderFriend = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    let friend = req.body.id;

    try {
        const result = await session.executeWrite(tx =>
            tx.run(
                `MATCH (r:Reader)-[re:FOLLOWS]->(r2:Reader)
                 WHERE ID(r) = ${id} AND ID(r2) = ${friend} 
                 DELETE re;`
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

exports.setreaderAuthor = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    let author = req.body.key;

    try {
        const result = await session.executeWrite(tx =>
            tx.run(
                `MATCH (r:Reader),(a:Author)
                 WHERE ID(r) = ${id} AND a.key = "${author}" 
                 MERGE (r)-[:FAN_OF]->(a);`
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

exports.deletereaderAuthor = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    let author = req.body.key;

    try {
        const result = await session.executeWrite(tx =>
            tx.run(
                `MATCH (r:Reader)-[re:FAN_OF]->(a:Author)
                 WHERE ID(r) = ${id} AND a.key = "${author}" 
                 DELETE re;`
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


exports.updateProfile = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let id = req.params.id;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH(r:Reader) WHERE ID(r) = ${id} RETURN r;`
            )

        );
        if(result.records.length===0){
            return next(new AppError('No reader found with that id',404))
        }
        const {
            first_name,
            last_name,
            bio
        } = req.body;

        const update = await session.executeWrite(tx =>
            tx.run(
                `MATCH (r:Reader)
                 WHERE ID(r) = ${id}
                 SET 
                 r.first_name="${first_name}",
                 r.last_name="${last_name}",
                 r.bio="${bio}";`
            )

        ); 
        res.status(200).json({
            status:'success'
        });
    }
    catch (e) {
    return next(new AppError('Internal server error',500))
    }
    finally {
        await session.close()
    }  
});