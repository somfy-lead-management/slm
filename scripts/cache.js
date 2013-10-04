define(function() {

    var Cache = function() {

        // Private properties
        var fs = false;
        var root;

        // Private methods
        var readFromFileEntry = function(fileEntry, success, error) {
            fileEntry.file(
                function(file) {
                    var reader = new FileReader();
                    reader.onloadend = function(evt){ success(evt.target.result); };
                    reader.readAsText(file);
                },
                function(err) { error(err); }
            );
        };
        var saveDataToFileEntry = function(fileEntry, data, success, error) {
            fileEntry.createWriter(
                function(writer) {
                    writer.onwrite = function(evt) { success(); };
                    writer.onerror = function(evt) { error(writer.error); };
                    writer.write(data);
                },
                function (err) { error(err); }
            );
        };

        var deleteFileEntry = function(fileEntry, callback) {
            var fname = fileEntry.name;
            fileEntry.remove(
                function(){ callback(fname, true); },
                function(){ callback(fname, false); }
            );
        };

        // Public interface
        return {
            initialize: function(callback) {
                if (window.requestFileSystem) {
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                        function(filesystem) {
                            fs = filesystem;
                            root = fs.root;
                            console.log("Cache.initialize()", "filesystem", root.fullPath);
                            if (typeof(callback) === "function") callback(true);
                        },
                        function(err) {
                            console.log("Failed getting LocalFileSystem.PERSISTENT filesystem");
                            if (typeof(callback) === "function") callback(false);
                        }
                    );
                }
                else if (typeof(callback) == "function") callback(false);
            },
            saveFile: function(filename, data, success, error) {
                if (!fs) { if (typeof(error) === "function") error(); return; }
                console.log("Cache.saveFile()", filename);
                root.getFile(filename, {create:true, exclusive:false},
                    function(fileEntry) { saveDataToFileEntry(fileEntry, data, success, error); },
                    function(err) { if (typeof(error) === "function") error(err); }
                );
            },
            getFile: function(filename, success, error) {
                if (!fs) { if (typeof(error) == "function") error(); return; }
                console.log("Cache.getFile()", filename);
                root.getFile(filename, null,
                    function(fileEntry){ readFromFileEntry(fileEntry, success); },
                    function(err){ if (typeof(error) === "function") error(err); }
                );
            },
            deleteFiles: function(files) {
                if (!fs) return;
                console.log("Cache.deleteFiles()", files);
                var onGetFile  = function(fileEntry) { deleteFileEntry(fileEntry, function(name, deleted) { console.log("Cache.deleteFiles()", name, deleted ? "YES" : "NO");}); };
                var onGetFileError = function(err) { console.log("Cache.deleteFiles()", "ERROR: Can't get file", err.code); };
                for (var i=0; i<files.length; i++) root.getFile(files[i], null, onGetFile, onGetFileError);
            }
        };
    };

    return Cache();

});