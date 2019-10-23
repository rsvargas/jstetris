const _PiecesData = [
    // I piece
    [ 
        [
            "    ",
            "    ",
            "****",
            "    ",
        ], [
            "  * ",
            "  * ",
            "  * ",
            "  * ",
        ]
    ],

    // O piece
    [
        [
            "    ", 
            " ** ",
            " ** ",
            "    ",
        ]
    ],

    // T piece
    [
        [
            " * ",
            "***",
            "   "
        ], [
            " * ",
            " **",
            " * ",
        ], [
            "   ",
            "***",
            " * ",
        ], [
            " * ",
            "** ",
            " * ",
        ]
    ],

    // S piece
    [
        [
            "   ",
            " **",
            "** ",
        ], [
            " * ",
            " **",
            "  *",
        ]
    ],

    // Z piece
    [
        [
            "   ",
            "** ",
            " **",
        ], [
            "  *",
            " **",
            " * ",
        ]
    ],

    // J piece
    [
        [
            " * ",
            " * ",
            "** "
        ], [
            "*  ",
            "***",
            "   "
        ], [
            " **",
            " * ",
            " * ",
        ], [
            "   ",
            "***",
            "  *"
        ]
    ],

    // L piece
    [
        [
            " * ",
            " * ",
            " **",
        ], [
            "   ",
            "***",
            "*  ",
        ], [
            "** ",
            " * ",
            " * ",
        ], [
            "  *",
            "***",
            "   ",
        ]
    ],
];

var Tetrimino = {
    _data: null,
    rotation: 0,

    _create: function() {
        return obj;
    },

    get: function(which) {
        var obj = Object.create(this);
        which %= _PiecesData.length;
        obj._data = _PiecesData[which];
        return obj;
    },

    rotate: function(right = true) {
        var r = this.rotation;
        if(right) { 
            r++; 
            if( r >= this._data.length) {
                r = 0;
            }
        } else {
            r--;
            if(r < 0) {
                r += this._data.length;
            }
        }
        this.rotation = r;
    },

    //Precompute all bounds data?
    bounds: function() {
        const data = this.data();
        var res = { 
            up: data.length,
            left: data[0].length,
            right: 0,
            down: 0,
        };
        for(let y in data) {
            for( let x in data[y]) {
                if( data[y][x] != ' ') {
                    x = parseInt(x);
                    if( x < res.left)
                        res.left = x;
                    if( x > res.right)
                        res.right = x;

                    y = parseInt(y);
                    if( y < res.up)
                        res.up = y;
                    if( y > res.down)
                        res.down = y;
                }
            }
        }
        return res;
    },

    data: function() {
        return this._data[this.rotation];
    }
};

var Game = {
    grid: null,
    tmpgrid: null,
    piece: null,
    piece_x: 0,
    piece_y: 0,
    next_piece_id: 0,
    next_piece: null,

    next_gravity: 0,
    gravity_interval: 0,
    paused: false,
    game_over: false,
    score: 0,


    create: function() {
        var obj = Object.create(this);
        obj.grid = []
        obj.reset();
        return obj;
    },

    reset: function() {
        this.grid.length = 0;
        for(let i=0; i< 40; i++) {
            this.grid.push( Array(10).fill(' ') );
        }
        this.paused = false;
        this.game_over = false;
        this.score = 0;
        this.gravity_interval = 200;
        this.next_gravity = performance.now() + this.gravity_interval;

        //first piece
        this.next_piece_id = Math.floor(Math.random()*7);
        this.next_piece = Tetrimino.get(this.next_piece_id);
        this.insert_next_piece();
    },

    update: function(timestamp) {
        if(this.game_over)
            return;

        if( !this.paused && this.next_gravity < timestamp) {
            this.next_gravity = timestamp + this.gravity_interval;
            this.gravity_step();
        }

        this.tmpgrid = JSON.parse(JSON.stringify(this.grid)); //doing a deep clone operation...

        const piece_data = this.piece.data();
        for(let y=0; y<piece_data.length; ++y) {
            let py = this.piece_y + y;
            if( py < 0)
                continue;
            if(py >= 40)
                break;
            for( let x=0; x<piece_data[y].length; ++x) {
                let px = this.piece_x + x;
                if(px < 0)
                    continue;
                if(px >=10)
                    break;
                if(piece_data[y][x] != ' ')
                    this.tmpgrid[py][px] = piece_data[y][x];
            }
        }
    },

    insert_next_piece: function() {
        let next = Math.floor(Math.random()*8);
        if( next == 7 || next == this.next_piece_id) {
            next = Math.floor(Math.random()*7);
        }
        this.piece = this.next_piece;
        this.piece_x = 3;
        this.piece_y = 20 - this.piece.bounds().down;
        this.next_piece_id = next;
        this.next_piece = Tetrimino.get(this.next_piece_id);

        if(this.check_collision(0,0))
            this.game_over = true;
    },

    check_collision: function(offset_x, offset_y) {
        let new_x = this.piece_x + offset_x;
        let new_y = this.piece_y + offset_y;
        const data = this.piece.data();

        for(let py=0; py<data.length; py++) {
            for(let px=0; px<data[py].length; px++) {
                if(data[py][px] == ' ')
                    continue;
                let final_x = new_x+px;
                let final_y = new_y+py;
                if( final_x < 0 || final_x>=10 || final_y<0 || final_y >= 40)
                    continue;

                if( this.grid[final_y][final_x] != ' ' ) {
                    return true;
                }
            }
        }
        return false;
    },

    //this will remove lines from the grid and return the removed line count
    remove_lines: function() {
        let line_count = 0;
        for(let y=39; y>=0; ) {
            let full = true;
            for( let x = 0; x<10; x++ ){
                if( this.grid[y][x] == ' ') {
                    full = false;
                    break;
                }
            }
            if(!full) {
                y--;
                continue;
            }
            console.log('line %d', y);

            for(let tmp=y; tmp>0; tmp--) {
                this.grid[tmp] = this.grid[tmp-1];
            }
            
        }
        return line_count;
    },

    _grid_str: function() {
        str = "";
        for(let y = 30; y< 40; ++y) {
            for(let x =0; x<10; ++x) {
                str += (this.tmpgrid[y][x] == ' ' ? '_' : '*' );
            }
            str += "\n";
        }
        return str;
    },

    gravity_step: function() {
        const bounds = this.piece.bounds();
        if( this.check_collision(0, 1) ||
            (this.piece_y + bounds.down + 1 >=40 ) ) 
        {
            this.consolidate();
            this.remove_lines();
            this.insert_next_piece();
            return;
        }
        this.piece_y += 1;
    },

    consolidate: function() {
        this.grid = this.tmpgrid;
    },
    
    //try to move the piece, @param left is true for left false for right
    move: function(left) {
        let offset = left? -1: 1; //RIGHT
        let bounds = this.piece.bounds();
        let new_val = this.piece_x + offset;

        if( new_val + bounds.left < 0) {
            return;  //clipping left
        }

        if( new_val + bounds.right >= 10) {
            return; //clipping right
        }
        this.piece_x = new_val;
    },

    //try to rotate the piiece #param cw is true for clockwise, false for counterclockwise
    rotate: function(cw) {
        this.piece.rotate(cw);
    },

    handleInput: function(code) {
        //37-left | 38-up | 39-right | 40-down | 32-space 
        switch(code) {
            case 37 /*left*/ : this.move(true); break;
            case 39 /* up */ : this.move(false); break;
            case 38 /*right*/: this.rotate(true); break;
            case 40 /*down*/ : this.gravity_step(); break;
            case 81 /* q */  : (this.paused = !this.paused); break; 
            case 82 /* r */  : this.reset(); break;
        }
    },

    render: function(ctx, screen_x, screen_y, sq_size) {
        var cur_y = screen_y;
        var cur_x = screen_x;
        for(let y=20; y<40;y++) {
            let s = sq_size;
            if( y< 20)
                s *= 0.3;
            cur_x = screen_x;
            for(let x=0; x<10; x++ ) {
                let color = 'lightgrey';
                if( y<20) color = 'lightcyan';
                if( this.tmpgrid[y][x] != ' ' ) color = 'black';

                Draw.rect(ctx, cur_x, cur_y, sq_size-1, s-1, {style: color, filled:true}  );
                cur_x += sq_size;
            }
            cur_y += s;
        }

        let small_sq = sq_size * 0.5;
        cur_y = screen_y + 30;
        let next_data = this.next_piece.data();
        for( let y=0; y<next_data.length; y++) {
            cur_x = screen_x + (sq_size * 10) + 30;
            for( let x=0; x<next_data[y].length; x++) {
                if( next_data[y][x] != ' ' ) {
                    let opts = { style: 'black', filled:true };
                    Draw.rect(ctx, cur_x, cur_y, small_sq-1, small_sq-1, opts);
                }
                cur_x += small_sq;
            }
            cur_y += small_sq;
        }

        if( this.game_over ) {
            ctx.font = "60px Arial";
            ctx.fillStyle = "red";
            ctx.fillText( "GAME OVER", screen_x+100, screen_y+100);
        }
    },
};

var d  = {};

window.onload = function() {
    var canvas = document.getElementById("layer-0"),
        context  = canvas.getContext("2d"),
        width = canvas.width = window.innerWidth,
        height = canvas.height = window.innerHeight;

    var debug = document.getElementById("debug");

    var game = Game.create();
    d.game = game;

    update(performance.now());

    function update(stamp) {
        requestAnimationFrame(update);
        context.clearRect(0, 0, width, height);
        game.update(stamp);
        game.render(context, 200, 150, 30);

    };

    // document.body.addEventListener("click", function(){
    // });    

    document.body.onkeydown = function(e) {
        game.handleInput(e.keyCode);
        str =  "keycode = " + e.keyCode + "<br/>";
        debug.innerHTML = str;
    }
}

