class FlowerService {
    constructor(db) {
        this.client = db.sequelize;
        this.flower = db.flower;
    }

    async getAll(condition, order, pagination) {
        return this.flower.findAll({
            limit: pagination.limit,
            offset: pagination.offset,
            where: condition,
            order: order
        }).catch(function (err) {
            console.log(err);
        });
    }
}
module.exports = FlowerService;