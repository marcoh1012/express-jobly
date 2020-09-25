process.env.NODE_ENV = 'test'

const partialUpdate = require("express-jobly/helpers/partialUpdate.js");

describe("partialUpdate()", () => {
    it("should generate a proper partial update query with just 1 field",
        function() {
            // FIXME: write real tests!
            let table = "table"
            let items = {
                col1: 'val1',
                col2: 'val2'
            }
            let key = 'id'
            let id = 1

            let res = partialUpdate(table, items, key, id)
            console.log(res)
            expect(res.query)
                .toEqual('UPDATE table SET col1=$1, col2=$2 WHERE id=$3 RETURNING *')
            expect(res.values)
                .toEqual(['val1', 'val2', 1])
        });
});