function DragDropUpload() {
    var defaultSongs = [
        'song.mp3',
        'song.mp3',
        'song.mp3',
        'song.mp3'
    ];

    var dragdropupload = {
        filename: null,
        init: function( audioAnalyser ) {
            document.body.addEventListener( 'drop', drop_handler, false );
            document.body.addEventListener( 'dragover', dragover_handler, false );

            var audioname = $( '<div></div>' );
                audioname.attr( 'id', 'audioname' );
            $( 'body' ).append( audioname );

            var instructions = $( '<div></div>' );
                instructions.attr( 'id', 'instructions' );
                //instructions.append( '<div>drop an .mp3</div>' );
                //instructions.append( "<div id='defaultsong'></div>" );
            $( 'body' ).append( instructions );

            $( '#defaultsong' ).on( 'click', function() {

                var mp3name = defaultSongs[parseInt( Math.random() * defaultSongs.length )];
                var request = new XMLHttpRequest();
 
                request.open('GET', 'songs/' + mp3name, true);
                request.responseType = 'arraybuffer';
                audioname.text( '[ Loading ]' );
                request.onload = function () {
                    audioname.text( mp3name.replace(/\.[^/.]+$/, "") );
                    $( '#instructions' ).fadeOut( function() { $(this).remove(); } );
                    $( '#warning' ).fadeOut( function() { $(this).remove(); } );
                    audioAnalyser.makeAudio( request.response );

                    var count = 7;
                    var counter = setInterval(timer, 1000); //1000 will  run it every 1 second

                    function timer() {
                        count = count-1;
                        if (count <= 0) {
                            clearInterval(counter);
                            input.enabled = true;
                            $( '#intro-circle' ).fadeOut();
                            $( '#blocksScene' ).fadeIn();
                            return;
                        }

                        // Do code for showing the number of seconds here
                        $( '#content' ).text(count).css('font-size', '35vh');;
                    }
                };
                
                request.send();
            } );

            function drop_handler( e ) {
                e.preventDefault();

                var droppedFiles = e.target.files || e.dataTransfer.files;
                audioname.text( droppedFiles[0].name.replace(/\.[^/.]+$/, "") );
                
                var reader = new FileReader();

                reader.onload = function( fileEvent ) {
                    $( '#instructions' ).fadeOut( function() { $(this).remove(); } );
                    $( '#warning' ).fadeOut( function() { $(this).remove(); } );
                    var data = fileEvent.target.result;
                    audioAnalyser.makeAudio( data );
                };
                //console.log(droppedFiles[0]);
                reader.readAsArrayBuffer( droppedFiles[0] );
                //var file = new File("jdjfjfd.mp3", null);
                //reader.readAsDataURL(file);

            }

            function dragover_handler( e ) {
                e.preventDefault();
            }
        }

    }

    return dragdropupload;
}