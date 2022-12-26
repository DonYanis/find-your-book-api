const catchAsyncErrors = require('../utils/catchAsyncErrors');
const driver = require('../neo4j');
const AppError = require('../utils/appError');


exports.getAllGenres = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    try {
        const result = await session.executeRead(tx =>
            tx.run(
            'MATCH (g:Genre)<-[:SPEAK_ABOUT]-(b:Book) RETURN g.name, COUNT(b) AS n ORDER BY n DESC;'
            )
        );
        let genres=[];
        result.records.forEach(e => {
            genres.push({ 'name' : e._fields[0], 'nb_books' : e._fields[1].low});
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

exports.getGenreBooks= catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let name = req.params.name;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH (g:Genre)<-[:SPEAK_ABOUT]-(b:Book) 
                 WHERE g.name = '${name}' 
                 RETURN b.title, b.isbn`
                )

        );
        if(result.records.length===0){
            return next(new AppError('No genre found with that name',404))
        }

        let books = [];
        result.records.forEach(e=>{
            books.push({"title" : e._fields[0], "isbn" : e._fields[1]});
        })

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

exports.getGenreReaders= catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let name = req.params.name;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH (g:Genre)<-[:HAS_READ_GENRE]-(r:Reader) 
                 WHERE g.name = '${name}' 
                 RETURN r.last_name, r.first_name ,r.email`
                )

        );

        let readers = [];
        result.records.forEach(e=>{
            readers.push(e._fields);
        })

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

exports.getGenreAuthors= catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    let name = req.params.name;
    try {
        const result = await session.executeRead(tx =>
            tx.run(
                `MATCH (g:Genre)<-[:SPEAK_ABOUT]-(b:Book)<-[:HAS_WRITTEN]-(a:Author) 
                 WHERE g.name = '${name}' 
                 RETURN DISTINCT a.key, a.name`
                )

        );

        let authors = [];
        result.records.forEach(e=>{
            authors.push(e._fields);
        })

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

exports.addGenre = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let name = req.body.name;

    try {
        const result = await session.executeWrite(tx =>
            tx.run(
                `CREATE (:Genre{name : "${name}"});`
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

exports.deleteGenre = catchAsyncErrors(async (req,res,next)=>{

    const session = await driver.session({database:"neo4j"});
    let name = req.body.name;

    try {
        const result = await session.executeWrite(tx =>
            tx.run(
                `MATCH (g:Genre)
                 WHERE g.name = "${name}" 
                 DETACH DELETE g;`
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