var _PiecesData = [
    // I piece
    [ 
        [
            [1],
            [1],
            [1],
            [1]
        ], [
            [ 1, 1, 1, 1]
        ]
    ],

    // O piece
    [
        [
            [1, 1],
            [1, 1],
        ]
    ],

    // T piece
    [
        [
            [0, 1, 0],
            [1, 1, 1],
        ], [
            [1, 0],
            [1, 1],
            [1, 0],
        ], [
            [1, 1, 1],
            [0, 1, 0],
        ], [
            [0, 1],
            [1, 1],
            [0, 1]
        ]
    ],

    // S piece
    [
        [
            [0, 1, 1],
            [1, 1, 0],
        ], [
            [1, 0],
            [1, 1],
            [0, 1]
        ]
    ],

    // Z piece
    [
        [
            [1, 1, 0],
            [0, 1, 1],
        ], [
            [0, 1],
            [1, 1],
            [1, 0]
        ]
    ],

    // J piece
    [
        [
            [0, 1],
            [0, 1],
            [1, 1],
        ], [
            [1, 0, 0],
            [1, 1, 1],
        ], [
            [1, 1],
            [1, 0],
            [1, 0],
        ], [
            [1, 1, 1],
            [0, 0, 1]
        ]
    ],

    // L piece
    [
        [
            [1, 0],
            [1, 0],
            [1, 1],
        ], [
            [1, 1, 1],
            [1, 0, 0]
        ], [
            [1, 1],
            [0, 1],
            [0, 1]
        ], [
            [0, 0, 1],
            [1, 1, 1]
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
        console.log("rotate: %d - %d", r, this._data.length);
        this.rotation = r;
    },

    data: function() {
        return this._data[this.rotation];
    }


};


var Board = {
    grid: null,
    tmpgrid: null,
    cur: null,

    create: function() {
        var obj = Object.create(this);
        obj.grid = []
        obj.reset();
        return obj;
    },

    reset: function() {
        this.grid.length = 0;
        for(let i=0; i< 40; i++) {
            this.grid.push( Array(10).fill(0) );
        }
        this.cur = Tetrimino.get(6);
        this.update();
    },

    update: function() {
        this.tmpgrid = JSON.parse(JSON.stringify(this.grid));
        var py = 25;
        var px = 5;
        this.cur.rotate();
        var pdata = this.cur.data();
        for(let y=0; y<pdata.length; ++y) {
            for( let x=0; x<pdata[y].length; ++x) {
                this.tmpgrid[py+y][px+x] = pdata[y][x];
            }
        }
    },

    render: function(ctx, x, y, sq_size) {
        var cur_y = y;
        for(let l in this.tmpgrid) {
            let s = sq_size;
            if( l< 20)
                s *= 0.3;
            var cur_x = x;
            for(let c in this.tmpgrid[l] ) {
                color = this.tmpgrid[l][c] == 0 ? 
                    (l<20? 'lightcyan': "lightgrey") : 
                    "black";
                Draw.rect(ctx, cur_x, cur_y, sq_size-1, s-1, {style: color, filled:true}  );
                cur_x += sq_size;
            }
            cur_y += s;
        }

    },

};

var State = State || {
    board: null,
    last_update: 0,

    create: function() {
        var obj = Object.create(this);
        obj.board = Board.create();
        return obj;
    },

    render: function(ctx) {
        this.board.render(ctx, 100, 10, 30 );
    },

    update: function(timestamp) {
        if( timestamp - this.last_update <500)
            return;
        this.last_update = timestamp;
        this.board.update();
    }

};

var d  = {};

window.onload = function() {
    var canvas = document.getElementById("layer-0"),
        context  = canvas.getContext("2d"),
        width = canvas.width = window.innerWidth,
        height = canvas.height = window.innerHeight;

    var state = State.create();
    d.state = state;

    update(0);

    function update(stamp) {
        context.clearRect(0, 0, width, height);
        state.update(stamp);
        state.render(context);

        requestAnimationFrame(update);
    };
}