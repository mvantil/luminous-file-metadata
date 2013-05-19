var _ = require('underscore'),
    Luminous = require('Luminous');
var luminous = new Luminous();

describe("Luminous File Metadata suite", function() {
    var metadata = luminous.metadata;

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

            expect(baseType.subTypes).toBeTruthy();

            done();
        });
    });

    it("must be able to retrieve sub types", function(done) {
        metadata.load('/baseType/subType', function(err, item) {
            expect(err).toBeFalsy();

            expect(item._id).toBe('/baseType/subType');
            done();
        });
    });
});
