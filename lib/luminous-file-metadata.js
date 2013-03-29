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

    var fileInfo;

    function getFileInfo(callback) {
    	if (fileInfo) return callback(null, fileInfo);

    	emitter.once('configLoaded', function(err, config) {
    		if (err) return callback(err);

    		var path = config && config.metadata && config.metadata.path
    			? config.metadata.path : './type';

    		try
    		{
	    		fs.readdir(path, function(err, files) {
	    			if (err) return callback(err);

	    			files = _.chain(files)
	    			.filter(function(item) {
	    				return /\.json$/.test(item);
	    			})
	    			.map(function(item) {
	    				return item.split('.')[0];
	    			}).value();

	    			callback(null, fileInfo = {
	    				path: path,
	    				files: files
	    			});
	    		})
	    	} catch (e) {
	    		callback(e);
	    	}
    	});
    }

    this.add = function(item, callback) {
    	getFileInfo(function(err, fileInfo) {
    		if (err) return callback(err);

    		fs.writeFile(path.join(fileInfo.path, item._id + '.json'), JSON.stringify(item, null, 4), callback);
    	});
    };

    this.load = function(typeName, callback) {
    	getFileInfo(function(err, fileInfo) {
    		if (err) return callback(err);

    		fs.readFile(path.join(fileInfo.path, typeName + '.json'), function(err, data) {
    			if (err) return callback(err);

    			callback(null, JSON.parse(data));
    		});
    	});
    };

    this.list = function(callback) {
    	getFileInfo(function(err, fileInfo) {
    		if (err) return callback(err);

    		async.map(fileInfo.files, function(typeName, callback) {
    			var fileName = path.join(fileInfo.path, typeName + '.json');
    			fs.readFile(fileName, function(err, data) {
    				callback(err, JSON.parse(data.toString()));
    			});
    		}, callback);
    	});
    };
}

Metadata.prototype = new _Metadata();

module.exports = Metadata;
