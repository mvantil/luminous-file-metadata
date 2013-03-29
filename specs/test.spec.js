var Metadata = require('../lib/luminous-file-metadata'),
    Luminous = require('luminous-base'),
    Config = Luminous.Config;

describe("Luminous File Metadata suite", function() {
    var metadata = new Metadata();

    var todoType = {
        _id: '/todo',
        fields: [{
            field: 'title',
            type: '/string'
        }]
    };

    it("must be able to add types", function(done) {
        metadata.add(todoType, function(err) {
            expect(err).toBeFalsy();
            done();
        });
    }, 1000);

    it("must be able to add types and retrieve them", function(done) {
        metadata.add(todoType, function(err) {
            expect(err).toBeFalsy();
            metadata.load(todoType._id, function(err, typeData) {
                expect(err).toBeFalsy();
                expect(typeData).toEqual(todoType);
                done();
            });
        });
    }, 1000);

    it("must be able to retrieve all types", function(done) {
        metadata.add(todoType, function(err) {
            expect(err).toBeFalsy();
            metadata.list(function(err, types) {
                expect(err).toBeFalsy();
                var todoTypeResult = types.reduceRight(function(prev, cur) {
                    return cur._id == todoType._id ? cur : null;
                });
                expect(todoTypeResult).toEqual(todoType);
                done();
            });
        });
    }, 1000);
});
