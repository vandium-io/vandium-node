const scanners = Object.freeze( {

    SQL: require( './sql' ),
    MONGODB: require( './mongodb' )
});

module.exports = {

    scanners
};
