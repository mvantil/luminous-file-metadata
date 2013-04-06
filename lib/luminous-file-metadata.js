var Luminous = require('luminous-base'),
    _Metadata = Luminous.Metadata,
    Config = Luminous.Config,
    EventEmitter = require('events').EventEmitter,
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    async = require('async');

function Metadata() {
    var emitter = new EventEmitter();
    var config = new Config();

    config.load(function(err, data) {
        emitter.emit('configLoaded', err, data);
        emitter.on('newListener', function(eventName, listener) {
            if (eventName == 'configLoaded') {
                listener(err, data);
            }
        });
    });

    var typeInfo;

    function getFileInfo(callback) {
        if (typeInfo) return callback(null, typeInfo);

    	emitter.once('configLoaded', function(err, config) {
    		if (err) return callback(err);

    		var path = config && config.metadata && config.metadata.path
    			? config.metadata.path : './type';

    		try
    		{
                readTypes(path, function(err, types) {
                    callback(null, typeInfo = {
                        path: path,
                        types: types
                    });
                });
	    	} catch (e) {
	    		callback(e);
	    	}
    	});
    }

    this.add = function(item, callback) {
    	getFileInfo(function(err, typeInfo) {
    		if (err) return callback(err);

            typeInfo.types[item._id] = item;

    		fs.writeFile(path.join(typeInfo.path, item._id + '.json'), JSON.stringify(item, null, 4), callback);
    	});
    };

    this.load = function(typeName, callback) {
    	getFileInfo(function(err, typeInfo) {
    		if (err) return callback(err);

            return callback(null, typeInfo.types[typeName]);
    	});
    };

    this.list = function(callback) {
    	getFileInfo(function(err, typeInfo) {
    		if (err) return callback(err);

            return callback(null, typeInfo.types);
    	});
    };

    function readTypes(directoryName, callback) {
        readFilesInDirectory(directoryName, function(err, items) {
            if (err) return callback(err);

            async.map(items, fs.readFile, function(err, files) {
                if (err) return callback(err);
                var typeMap = {};

                var subTypes = [];
                _.each(files, function(file) {
                    var type = JSON.parse(file);
                    if (!type.inherits) {
                        typeMap[type._id] = type;
                    } else {
                        subTypes.push(type);
                    }
                });

                _.each(subTypes, function(type) {
                    var baseType = typeMap[type.inherits];
                    if (!baseType.subTypes) {
                        baseType.subTypes = [];
                    }
                    baseType.subTypes.push(type);
                });
                callback(null, typeMap);
            });
        });
    }

    function readFilesInDirectory(directoryName, callback) {
        if (!callback) throw new Error('Must supply a callback');

        var result = [];
        var subDirectories = [];
        fs.readdir(directoryName, function(err, files) {
            if (err) return;

            _.each(files, function(file) {
                if (file.match(/\.json$/i)) {
                    result.push(path.join(directoryName, file));
                } else {
                    subDirectories.push(path.join(directoryName, file));
                }
            })

            async.map(subDirectories, function(directoryName, callback) {
                readFilesInDirectory(directoryName, function(err, items) {
                    callback(err, items);
                });
            }, function(err, items) {
                _.each(items, function(item) {
                    result = result.concat(item);
                });
                callback(err, result);
            });
        });

    }
}

Metadata.prototype = new _Metadata();

module.exports = Metadata;
