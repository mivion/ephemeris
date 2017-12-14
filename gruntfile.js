module.exports = function( grunt ) {
	
	// Dynamically load npm tasks	
	require('load-grunt-tasks')(grunt);
		
	grunt.initConfig( {			
		pkg: grunt.file.readJSON( 'package.json' ),
		
		srcFiles: ['index.js',
				   'common.js',
				   
				   'astronomy/index.js', 
				   
				   'astronomy/moshier/index.js',  
				   'astronomy/moshier/constant.js', 
				   'astronomy/moshier/julian.js',
				   'astronomy/moshier/delta.js',				   
				   'astronomy/moshier/epsilon.js',
				   'astronomy/moshier/lonlat.js',
				   'astronomy/moshier/gplan.js',				   
				   'astronomy/moshier/precess.js',
				   'astronomy/moshier/util.js',
				   'astronomy/moshier/kepler.js',
				   'astronomy/moshier/body.js',				   
				   'astronomy/moshier/sun.js', 
				   'astronomy/moshier/aberration.js',  
				   'astronomy/moshier/altaz.js', 
				   'astronomy/moshier/constellation.js',
				   'astronomy/moshier/deflection.js',				   
				   'astronomy/moshier/diurnal.js',
				   'astronomy/moshier/fk4fk5.js',
				   'astronomy/moshier/light.js',				   
				   'astronomy/moshier/moon.js',
				   'astronomy/moshier/nutation.js',
				   'astronomy/moshier/planet.js',
				   'astronomy/moshier/refraction.js',				   				  
				   'astronomy/moshier/siderial.js',				   
				   'astronomy/moshier/star.js', 
				   'astronomy/moshier/transit.js',  
				   'astronomy/moshier/vearth.js', 
				   'astronomy/moshier/processor.js',
				   
				   'astronomy/moshier/plan404/index.js',				   
				   'astronomy/moshier/plan404/mercury.js',
				   'astronomy/moshier/plan404/venus.js',
				   'astronomy/moshier/plan404/earth.js',				   
				   'astronomy/moshier/plan404/moonlr.js',
				   'astronomy/moshier/plan404/moonlat.js',
				   'astronomy/moshier/plan404/mars.js',
				   'astronomy/moshier/plan404/jupiter.js',				   
				   'astronomy/moshier/plan404/saturn.js',				   
				   'astronomy/moshier/plan404/uranus.js', 
				   'astronomy/moshier/plan404/neptune.js',  
				   'astronomy/moshier/plan404/pluto.js', 
				   
				   'shortcut.js'				   
				   ],
				   
		concat : {					
			options: {        	
        		stripBanners: true,
      			banner: '/* <%= pkg.name %> v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */',
       		 	process: function(src, filepath) {
          			return '\n// ### Source: ' + filepath + '\n' + src;
        		},
      		},	
      		
      		dist: {
      			files: {
        			'build/<%= pkg.name %>-<%= pkg.version %>.js': "<%= srcFiles %>"        			
      			},
    		},      									
		},	   
								
        uglify : {				
			dist : {
				files : {
					'build/<%= pkg.name %>-<%= pkg.version %>.min.js' : ['build/<%= pkg.name %>-<%= pkg.version %>.js']
				}
			}
		}					   	    	  
	});
	
	grunt.registerTask("default", [
		"concat",
		"uglify"    		
  	]);
	
	grunt.registerTask( 'build', [
		"concat",
		"uglify"				
	]);				
};