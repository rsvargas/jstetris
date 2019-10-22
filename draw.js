var Draw = Draw || {

    multiline: function(context, points, opts) {
        options = {
            closed: false,
            style: "black",
            filled: false,
            width: 1
        };
        if(opts !== undefined && opts.constructor === Object) {
            for(var o in opts){
                options[o] = opts[o];
            }
        }
        context.beginPath();
        context.lineWidth = options.width;
        context.moveTo(points[0].x, points[0].y);
        for(var i=1; i< points.length; i++) {
            context.lineTo(points[i].x, points[i].y);
        }
        if( options.closed) {
            context.closePath();
        }
        if( options.filled) {
            context.fillStyle = options.style;
            context.fill();
        } else {
            context.strokeStyle = options.style;
            context.stroke();
        }
    },

    rect: function(ctx, x,y, w,h, opts) {
        opts = opts || {};
        opts.closed = true;
        this.multiline(ctx, [{x:x,y:y}, {x:x+w, y:y}, {x:x+w,y:y+h}, {x:x,y:y+h}], opts);        
    },

    circle: function(ctx, point, radius, opts) {
        options = {style: "black", filled: true, alpha: 1};
        if(opts !== undefined && opts.constructor === Object) {
            for(var o in opts){
                options[o] = opts[o];
            }
        }
        ctx.beginPath();
        ctx.globalAlpha = options.alpha;
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2, false);
        if( options.filled) {
            ctx.fillStyle = options.style;
            ctx.fill();
        } else {
            ctx.strokeStyle = options.style;
            ctx.stroke();
        }
    },    

    _overrideOpts: function(defaults, opts) {
        if( opts != undefined && opts.constructor === Object) {
            for( let o in opts) {
                defaults[o] = opts[o];
            }
        }
        return defaults;
    },
};