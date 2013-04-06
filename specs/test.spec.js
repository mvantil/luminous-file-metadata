var Metadata = require('../lib/luminous-file-metadata'),
    Luminous = require('luminous-base'),
    _ = require('underscore'),
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
                
                var todoTypeResult = _.chain(types)
                .filter(function(item) {
                    return item._id == todoType._id;
                })
                .first()
                .value();

                expect(todoTypeResult).toEqual(todoType);
                done();
            });
        });
    }, 1000);

    it("must wrap sub types into base type", function(done) {
        metadata.list(function(err, types) {
            expect(err).toBeFalsy();

            var baseType = _.chain(types)
            .filter(function(item) {
                return item._id == '/baseType';
            })
            .first()
            .value();

            console.log('baseType: ', baseType);
            expect(baseType.subTypes).toBeTruthy();

            done();
        });
    });
});
