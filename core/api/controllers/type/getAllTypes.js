module.exports = async function getAllTypes(req, res, utils) {
    utils.ExecuteAction(res, `SELECT * FROM type`, rows => {
        res.status(200).json(rows);
    });
}