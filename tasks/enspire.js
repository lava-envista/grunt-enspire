/*
 * grunt-enspire
 * https://github.com/jasonfutch/grunt-enspire
 *
 * Copyright (c) 2015 jasonfutch
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerTask('enspire','A plugin for specific use within Enspire Commerce.', function(arg1, arg2) {

        // Holds platform.json config
        var objPlatform;

        // Holds required dependencies
        var required = {
            modules:[],
            views:[],
            bower:[]
        };

        if(grunt.option('commands')){
            grunt.log.writeln('\nOptions:');
            grunt.log.writeln('\t--init \t\t\t Creates an empty platform.json file');
            grunt.log.writeln('\t--init-force \t\t Overwrites platform.json with an empty file');
            grunt.log.writeln('\t--init-bower \t\t Creates a default .browerrc file');
            grunt.log.writeln('\t--init-bower-force \t Overwrites a .browerrc with a default file');
            grunt.log.writeln('\t--theme \t\t Defines the theme to use, instead of the one defined in platform.json');
            return true;
        }

        //Create platform.json
        if(grunt.option('init') || grunt.option('init-force')){
            if(grunt.file.exists('platform.json') && !grunt.option('init-force')){
                grunt.log.error('"platform.json" already exists, to overwrite run "grunt enspire --init-force" command');
                return false;
            }
            grunt.file.write('platform.json','{\n\t"theme":"",\n\t"modules":[],\n\t"views":[],\n\t"includes":{\n\t\t"js":[],\n\t\t"css":[],\n\t\t"scss":[]\n\t}\n}');
            return true;
        }

        //Create .bowerrc
        if(grunt.option('init') || grunt.option('init-bower')){
            if(grunt.file.exists('.bowerrc') && !grunt.option('init-bower-force')){
                grunt.log.error('".bowerrc" already exists, to overwrite run "grunt enspire --init-bower-force" command');
                return false;
            }
            grunt.file.write('.bowerrc','{\n\t"directory":"bower_components",\n\t"json":"bower.json"\n}');
            return true;
        }

        if(!grunt.file.exists('platform.json')){
            grunt.log.error('"platform.json" is a required file and must be in the root directory. To create an empty one run "grunt enspire --init" command');
            return false;
        }

        objPlatform = grunt.file.readJSON('platform.json');

        if(objPlatform.bower_directory===undefined){
            if(!grunt.file.exists('.bowerrc')){
                grunt.log.error('".bowerrc" file is a required if bower_directory is not defined in "platform.json". To create a default one run "grunt enspire --init-bower" command');
                return false;
            }

            var bowerrc = grunt.file.readJSON('.bowerrc');
            objPlatform.bower_directory = bowerrc.directory;
        }

        if(!grunt.file.exists(objPlatform.bower_directory)){
            grunt.log.error('"'+objPlatform.bower_directory+'" directory was not found, try running "bower install" command.');
            return false;
        }

        if(!grunt.file.exists(objPlatform.bower_directory+'/enspire.platform/')){
            grunt.log.error('"enspire.platform" folder was not found in your '+objPlatform.bower_directory+' directory.');
            return false;
        }

        if(!grunt.file.exists(objPlatform.bower_directory+'/enspire.ui/')){
            grunt.log.error('"enspire.ui" folder was not found in your '+objPlatform.bower_directory+' directory.');
            return false;
        }

        if(grunt.option('theme')!==undefined){
            if(grunt.option('theme')===0){
                grunt.log.error('"--themes" option can not be blank, it must have a value. ex: "--theme=myThemeName"');
                return false;
            }
            if(grunt.option('theme')===0 || grunt.option('theme')===true){
                grunt.log.error('"--themes" must have a value defined. ex: "--theme=myThemeName"');
                return false;
            }
            objPlatform.theme = grunt.option('theme');
        }

        if(objPlatform.theme===undefined || objPlatform.theme===''){
            if(objPlatform.theme===undefined) grunt.log.warn('"theme" is undefined in the "platform.json" file');
            if(objPlatform.theme==='') grunt.log.warn('"theme" is blank in the "platform.json" file');
        }else{
            if(!grunt.file.exists(objPlatform.bower_directory+'/enspire.platform/themes/')){
                grunt.log.error('"themes" folder is missing from "'+objPlatform.bower_directory+'/enspire.platform" directory.');
                return false;
            }

            if(!grunt.file.exists(objPlatform.bower_directory+'/enspire.platform/themes/'+objPlatform.theme+'/')){
                grunt.log.error('"'+objPlatform.theme+'" theme does not exist in "'+objPlatform.bower_directory+'/enspire.platform/themes/" directory.');
                return false;
            }
        }

        if(objPlatform.modules!==undefined){
            if(!Array.isArray(objPlatform.modules)){
                grunt.log.error('"modules" must be an array in the "platform.json" file');
                return false;
            }

            var folderModules = objPlatform.bower_directory+'/enspire.platform/modules/';
            if(!grunt.file.exists(folderModules)){
                grunt.log.error('"modules" folder is missing from "'+folderModules+'" directory.');
                return false;
            }

            var lngModules = objPlatform.modules.length;
            for(var i=0;i<lngModules;i++){
                var moduleName = objPlatform.modules[i];
                var moduleFolder = folderModules+moduleName+'/';

                if(moduleName===''){
                    grunt.log.error('"'+moduleName+'" module does not exist in "'+folderModules+'" directory. Please remove the empty string from your array in "modules" property of your "plaform.json" file.');
                    return false;
                }

                if(!grunt.file.exists(moduleFolder)){
                    grunt.log.error('"'+moduleName+'" module does not exist in "'+folderModules+'" directory.');
                    return false;
                }else{
                    var moduleConfig = moduleFolder+'.enspirerc';
                    if(grunt.file.exists(moduleConfig)){
                        var objModuleConfig = grunt.file.readJSON(moduleConfig);

                        if(objModuleConfig.dependencies!==undefined){
                            if(objModuleConfig.dependencies.modules!==undefined){
                                if(!Array.isArray(objModuleConfig.dependencies.modules)){
                                    grunt.log.error('"'+moduleConfig+'" dependencies.module property must be in an array format.');
                                    return false;
                                }

                                var lngModulesDependencyModules = objModuleConfig.dependencies.modules.length;
                                for(var x=0; x<lngModulesDependencyModules; x++){
                                    var ModulesDependencyModule = objModuleConfig.dependencies.modules[x];
                                    if(required.modules.indexOf(ModulesDependencyModule) == -1 && objPlatform.modules.indexOf(ModulesDependencyModule) == -1){
                                        required.modules.push(ModulesDependencyModule);
                                    }
                                }
                            }
                            console.log(required.modules);
                        }
                    }
                }
            }
        }

        if(objPlatform.views!==undefined){
            if(!Array.isArray(objPlatform.views)){
                grunt.log.error('"views" must be an array in the "platform.json" file');
                return false;
            }

            if(!grunt.file.exists(objPlatform.bower_directory+'/enspire.platform/views/')){
                grunt.log.error('"views" folder is missing from "'+objPlatform.bower_directory+'/enspire.platform" directory.');
                return false;
            }

            var lngViews = objPlatform.views.length;
            for(var i=0;i<lngViews;i++){
                var aryFiles = grunt.file.expand({cwd:objPlatform.bower_directory+'/enspire.platform/views/'},objPlatform.views[i]);
                if(aryFiles.length===0){
                    grunt.log.warn('"'+objPlatform.views[i]+'" does not return any files from the "'+objPlatform.bower_directory+'/enspire.platform/views/" directory.');
                }
            }
        }

        if(objPlatform.includes!==undefined){
            if(objPlatform.includes.js!==undefined){
                var lngJS = objPlatform.includes.js.length;
                for(var i=0;i<lngJS;i++){
                    var aryFiles = grunt.file.expand(objPlatform.includes.js[i]);
                    if(aryFiles.length===0){
                        grunt.log.warn('"'+objPlatform.includes.js[i]+'" does not return any files.');
                    }else{
                        var hasJS = false;
                        for(var x=0;x<aryFiles.length;x++){
                            if(aryFiles[x].indexOf('.js', aryFiles[x].length - 3) !== -1) hasJS = true;
                        }
                        if(hasJS===false){
                            grunt.log.warn('"'+objPlatform.includes.js[i]+'" does not return any *.js files.');
                        }
                    }
                }
            }

            if(objPlatform.includes.css!==undefined){
                var lngCSS = objPlatform.includes.css.length;
                for(var i=0;i<lngCSS;i++){
                    var aryFiles = grunt.file.expand(objPlatform.includes.css[i]);
                    if(aryFiles.length===0){
                        grunt.log.warn('"'+objPlatform.includes.css[i]+'" does not return any files.');
                    }else{
                        var hasCSS = false;
                        for(var x=0;x<aryFiles.length;x++){
                            if(aryFiles[x].indexOf('.css', aryFiles[x].length - 4) !== -1) hasCSS = true;
                        }
                        if(hasCSS===false){
                            grunt.log.warn('"'+objPlatform.includes.css[i]+'" does not return any *.css files.');
                        }
                    }
                }
            }

            if(objPlatform.includes.scss!==undefined){
                var lngSCSS = objPlatform.includes.scss.length;
                for(var i=0;i<lngSCSS;i++){
                    var aryFiles = grunt.file.expand(objPlatform.includes.scss[i]);
                    if(aryFiles.length===0){
                        grunt.log.warn('"'+objPlatform.includes.scss[i]+'" does not return any files.');
                    }else{
                        var hasSCSS = false;
                        for(var x=0;x<aryFiles.length;x++){
                            if(aryFiles[x].indexOf('.scss', aryFiles[x].length - 5) !== -1) hasSCSS = true;
                            if(aryFiles[x].indexOf('.sass', aryFiles[x].length - 5) !== -1) hasSCSS = true;
                        }
                        if(hasSCSS===false){
                            grunt.log.warn('"'+objPlatform.includes.scss[i]+'" does not return any *.scss or *.sass files.');
                        }
                    }
                }
            }
        }

        if(!grunt.file.exists('src')){
            grunt.log.error('"src" folder is missing from root directory, try running "yo enspire" to setup scaffolding.');
            return false;
        }

        if(!grunt.file.exists('src/js')){
            grunt.log.error('"js" folder was not found in your "src" directory.');
        }
        if(!grunt.file.exists('src/styles')){
            grunt.log.error('"styles" folder was not found in your "src" directory.');
        }
        if(!grunt.file.exists('src/views')){
            grunt.log.error('"views" folder was not found in your "src" directory.');
        }

        if(!grunt.file.exists('src/index.html')){
            grunt.log.error('"index.html" missing from your "src" directory.');
            return false;
        }

        var js = [];
        var css = [];
        var scss = [];


    });



    //grunt.registerMultiTask('enspire', 'A plugin for specific use with in Enspire Commerce.', function() {
    //  // Merge task-specific and/or target-specific options with these defaults.
    //  var options = this.options({
    //    punctuation: '.',
    //    separator: ', '
    //  });
    //
    //  // Iterate over all specified file groups.
    //  this.files.forEach(function(f) {
    //    // Concat specified files.
    //    var src = f.src.filter(function(filepath) {
    //      // Warn on and remove invalid source files (if nonull was set).
    //      if (!grunt.file.exists(filepath)) {
    //        grunt.log.warn('Source file "' + filepath + '" not found.');
    //        return false;
    //      } else {
    //        return true;
    //      }
    //    }).map(function(filepath) {
    //      // Read file source.
    //      return grunt.file.read(filepath);
    //    }).join(grunt.util.normalizelf(options.separator));
    //
    //    // Handle options.
    //    src += options.punctuation;
    //
    //    // Write the destination file.
    //    grunt.file.write(f.dest, src);
    //
    //    // Print a success message.
    //    grunt.log.writeln('File "' + f.dest + '" created.');
    //  });
    //});

};
