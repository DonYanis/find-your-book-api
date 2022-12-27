const catchAsyncErrors = require('../utils/catchAsyncErrors');
const driver = require('../neo4j');
const AppError = require('../utils/appError');

exports.getGlobalStats = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    try {

        const books = await session.executeRead(tx =>
            tx.run(`MATCH (b:Book) RETURN COUNT(b);`)
        );
        let total = books.records[0]._fields[0].low;

        const readbooks = await session.executeRead(tx =>
            tx.run(`MATCH (r)-[:HAS_READ]->(b:Book) RETURN COUNT(DISTINCT b);`)
        );
        let read = readbooks.records[0]._fields[0].low;
        
        const visitedbooks = await session.executeRead(tx =>
            tx.run(`MATCH (r)-[:VISITED]->(b:Book) RETURN COUNT(DISTINCT b);`)
        );
        let visited = visitedbooks.records[0]._fields[0].low;
        
        const wantedbooks = await session.executeRead(tx =>
            tx.run(`MATCH (r)-[:WANT_READ]->(b:Book) RETURN COUNT(DISTINCT b);`)
        );
        let wanted = wantedbooks.records[0]._fields[0].low;

        const likedbooks = await session.executeRead(tx =>
            tx.run(`MATCH (r)-[:LIKE]->(b:Book) RETURN COUNT(DISTINCT b);`)
        );
        let liked = likedbooks.records[0]._fields[0].low;

        const readers = await session.executeRead(tx =>
            tx.run(`MATCH (r:Reader) RETURN COUNT(DISTINCT r);`)
        );
        let nbreaders = readers.records[0]._fields[0].low;

        const nbAuthors = await session.executeRead(tx =>
            tx.run(`MATCH (a:Author) RETURN COUNT(a);`)
        );
        let authors = nbAuthors.records[0]._fields[0].low;

        const nbFAuthors = await session.executeRead(tx =>
            tx.run(`MATCH (a:Author)<-[:FAN_OF]-(r) RETURN COUNT(DISTINCT a);`)
        );
        let followed = nbFAuthors.records[0]._fields[0].low;

        const nbPub = await session.executeRead(tx =>
            tx.run(`MATCH (p:Publisher)-[:HAS_PUBLISHED]->(b) RETURN COUNT(DISTINCT p);`)
        );

        const Genres = await session.executeRead(tx =>
            tx.run(`MATCH (g:Genre) RETURN COUNT(DISTINCT g);`)
        );
        let genres = Genres.records[0]._fields[0].low;

        const readerGenres = await session.executeRead(tx =>
            tx.run(`MATCH (r:Reader)-[:HAS_READ_GENRE]->(g:Genre)
                    RETURN g.name , COUNT (DISTINCT r) AS nbr ORDER BY nbr DESC;`)
        );
        let readerGs = [];
        readerGenres.records.forEach(e=>{
            readerGs.push([e._fields[0],e._fields[1].low]);
        });
        const bookGenres = await session.executeRead(tx =>
            tx.run(`MATCH (b:Book)-[:SPEAK_ABOUT]->(g:Genre)
                    RETURN g.name , COUNT (DISTINCT b) AS nbr ORDER BY nbr DESC;`)
        );
        let bookGs = [];
        bookGenres.records.forEach(e=>{
            bookGs.push([e._fields[0],e._fields[1].low]);
        });
        
        
        let stats={
            books:{
                total,
                read,
                wanted,
                liked,
                visited,
                readAmongTotal: (read*100/total).toFixed(2),
                visitedAmongTotal: (visited*100/total).toFixed(2),
                wantedAmongTotal: (wanted*100/total).toFixed(2),
                likedAmongTotal: (liked*100/total).toFixed(2),
                likedAmongRead: (liked*100/read).toFixed(2),
                readAmongVisited: (read*100/visited).toFixed(2),
                wantedAmongVisited: (wanted*100/visited).toFixed(2),
            },
            genres:{
                total:genres,
                booksByGenre:bookGs,
                readersByGenre:readerGs
            },
            readers:{
                total:nbreaders
            },
            authors:{
                total:authors,
                haveFans:(followed*100/authors).toFixed(2)
            },
            publishers:{
                total:nbPub.records[0]._fields[0].low
            }
        }

        res.status(200).json({
            status:'success',
            result: 1,
            data : {
                stats
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

exports.getPersonalStats = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    const id = req.params.id;

    try {
        const user = await session.executeRead(tx =>
            tx.run(`MATCH (r:Reader) WHERE ID(r)=${id} RETURN r;`)
        );
        if(user.records.length===0){
            return next(new AppError("User not found",404));
        }


        const readbooks = await session.executeRead(tx =>
            tx.run(`MATCH (r:Reader)-[:HAS_READ]->(b:Book) WHERE ID(r)=${id} RETURN COUNT(DISTINCT b);`)
        );
        let read = readbooks.records[0]._fields[0].low;
        
        const visitedbooks = await session.executeRead(tx =>
            tx.run(`MATCH (r)-[:VISITED]->(b:Book) WHERE ID(r)=${id} RETURN COUNT(DISTINCT b);`)
        );
        let visited = visitedbooks.records[0]._fields[0].low;
        
        const wantedbooks = await session.executeRead(tx =>
            tx.run(`MATCH (r)-[:WANT_READ]->(b:Book) WHERE ID(r)=${id} RETURN COUNT(DISTINCT b);`)
        );
        let wanted = wantedbooks.records[0]._fields[0].low;

        const likedbooks = await session.executeRead(tx =>
            tx.run(`MATCH (r)-[:LIKE]->(b:Book) WHERE ID(r)=${id} RETURN COUNT(DISTINCT b);`)
        );
        let liked = likedbooks.records[0]._fields[0].low;

        const Genres = await session.executeRead(tx =>
            tx.run(`MATCH (r:Reader)-[:HAS_READ_GENRE]->(g:Genre) WHERE ID(r)=${id} RETURN COUNT(DISTINCT g);`)
        );
        let genres = Genres.records[0]._fields[0].low;

        const readGenres = await session.executeRead(tx =>
            tx.run(`MATCH (r:Reader)-[re:HAS_READ_GENRE]->(g:Genre) WHERE ID(r)=${id} 
                    RETURN g.name , re.reading_count as nbr ORDER BY nbr DESC;`)
        );
        let readGs = [];
        readGenres.records.forEach(e=>{
            readGs.push([e._fields[0],e._fields[1].low]);
        });

        const visitedGenres = await session.executeRead(tx =>
            tx.run(`MATCH (r:Reader)-[re:VISITED]->(b:Book)-[:SPEAK_ABOUT]->(g:Genre) WHERE ID(r)=${id} 
                    RETURN g.name , COUNT(g) as nbr ORDER BY nbr DESC;`)
        );
        let visitedGs = [];
        visitedGenres.records.forEach(e=>{
            visitedGs.push([e._fields[0],e._fields[1].low]);
        });

        const likedGenres = await session.executeRead(tx =>
            tx.run(`MATCH (r:Reader)-[re:LIKE]->(b:Book)-[:SPEAK_ABOUT]->(g:Genre) WHERE ID(r)=${id} 
                    RETURN g.name , COUNT(g) as nbr ORDER BY nbr DESC;`)
        );
        let likedGs = [];
        likedGenres.records.forEach(e=>{
            likedGs.push([e._fields[0],e._fields[1].low]);
        });

        const visitMonth = await session.executeRead(tx =>
            tx.run(`MATCH (r:Reader)-[v:VISITED]->(b:Book) WHERE ID(r)=${id} 
                    RETURN date(datetime({epochmillis:v.date})).month AS mois,
                    date(datetime({epochmillis:v.date})).year AS annee, count(b) AS nbr_visits;`)
        );
        let monthlyVisits = [];
        visitMonth.records.forEach(e=>{
            monthlyVisits.push([e._fields[0].low,e._fields[1].low,e._fields[2].low]);
        });

        const readMonth = await session.executeRead(tx =>
            tx.run(`MATCH (r:Reader)-[re:HAS_READ]->(b:Book) WHERE ID(r)=${id} 
                    RETURN date(datetime({epochmillis:re.date})).month AS mois,
                    date(datetime({epochmillis:re.date})).year AS annee, count(b) AS nbr_reads;`)
        );
        let monthlyReads = [];
        readMonth.records.forEach(e=>{
            monthlyReads.push([e._fields[0].low,e._fields[1].low,e._fields[2].low]);
        });
        
        
        
        let stats={
            books:{
                read,
                wanted,
                liked,
                visited,
                likedAmongRead: (liked*100/read).toFixed(2),
                readAmongVisited: (read*100/visited).toFixed(2),
                wantedAmongVisited: (wanted*100/visited).toFixed(2)
            },
            genres:{
                total:genres,
                readbooksByGenre:readGs,
                likedbooksByGenre:likedGs,
                visitedbooksByGenre:visitedGs
            },
            monthlyVisits,
            monthlyReads
        }

        res.status(200).json({
            status:'success',
            result: 1,
            data : {
                stats
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

exports.getBookVisitStats = catchAsyncErrors(async (req,res,next)=>{
    const session = await driver.session({database:"neo4j"});
    const isbn = req.params.isbn;
    
    try {
        const book = await session.executeRead(tx =>
            tx.run(`MATCH (b:Book) WHERE b.isbn="${isbn}" RETURN b;`)
        );
        if(book.records.length===0){
            return next(new AppError("book not found",404));
        }

        const visitMonth = await session.executeRead(tx =>
            tx.run(`MATCH (r:Reader)-[v:VISITED]->(b:Book) WHERE b.isbn="${isbn}"
                    RETURN date(datetime({epochmillis:v.date})).month AS mois,
                    date(datetime({epochmillis:v.date})).year AS annee, count(r) AS nbr_visits;`)
        );
        let monthlyVisits = [];
        visitMonth.records.forEach(e=>{
            monthlyVisits.push([e._fields[0].low,e._fields[1].low,e._fields[2].low]);
        });      
        
        let stats={
            monthlyVisits
        }

        res.status(200).json({
            status:'success',
            result: 1,
            data : {
                stats
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
