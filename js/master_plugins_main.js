!(function (a, b, c, d) {
  function e(b, c) {
    (this.settings = null),
      (this.options = a.extend({}, e.Defaults, c)),
      (this.$element = a(b)),
      (this._handlers = {}),
      (this._plugins = {}),
      (this._supress = {}),
      (this._current = null),
      (this._speed = null),
      (this._coordinates = []),
      (this._breakpoint = null),
      (this._width = null),
      (this._items = []),
      (this._clones = []),
      (this._mergers = []),
      (this._widths = []),
      (this._invalidated = {}),
      (this._pipe = []),
      (this._drag = {
        time: null,
        target: null,
        pointer: null,
        stage: { start: null, current: null },
        direction: null,
      }),
      (this._states = {
        current: {},
        tags: {
          initializing: ["busy"],
          animating: ["busy"],
          dragging: ["interacting"],
        },
      }),
      a.each(
        ["onResize", "onThrottledResize"],
        a.proxy(function (b, c) {
          this._handlers[c] = a.proxy(this[c], this);
        }, this)
      ),
      a.each(
        e.Plugins,
        a.proxy(function (a, b) {
          this._plugins[a.charAt(0).toLowerCase() + a.slice(1)] = new b(this);
        }, this)
      ),
      a.each(
        e.Workers,
        a.proxy(function (b, c) {
          this._pipe.push({ filter: c.filter, run: a.proxy(c.run, this) });
        }, this)
      ),
      this.setup(),
      this.initialize();
  }
  (e.Defaults = {
    items: 3,
    loop: !1,
    center: !1,
    rewind: !1,
    checkVisibility: !0,
    mouseDrag: !0,
    touchDrag: !0,
    pullDrag: !0,
    freeDrag: !1,
    margin: 0,
    stagePadding: 0,
    merge: !1,
    mergeFit: !0,
    autoWidth: !1,
    startPosition: 0,
    rtl: !1,
    smartSpeed: 250,
    fluidSpeed: !1,
    dragEndSpeed: !1,
    responsive: {},
    responsiveRefreshRate: 200,
    responsiveBaseElement: b,
    fallbackEasing: "swing",
    slideTransition: "",
    info: !1,
    nestedItemSelector: !1,
    itemElement: "div",
    stageElement: "div",
    refreshClass: "owl-refresh",
    loadedClass: "owl-loaded",
    loadingClass: "owl-loading",
    rtlClass: "owl-rtl",
    responsiveClass: "owl-responsive",
    dragClass: "owl-drag",
    itemClass: "owl-item",
    stageClass: "owl-stage",
    stageOuterClass: "owl-stage-outer",
    grabClass: "owl-grab",
  }),
    (e.Width = { Default: "default", Inner: "inner", Outer: "outer" }),
    (e.Type = { Event: "event", State: "state" }),
    (e.Plugins = {}),
    (e.Workers = [
      {
        filter: ["width", "settings"],
        run: function () {
          this._width = this.$element.width();
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (a) {
          a.current = this._items && this._items[this.relative(this._current)];
        },
      },
      {
        filter: ["items", "settings"],
        run: function () {
          this.$stage.children(".cloned").remove();
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (a) {
          var b = this.settings.margin || "",
            c = !this.settings.autoWidth,
            d = this.settings.rtl,
            e = {
              width: "auto",
              "margin-left": d ? b : "",
              "margin-right": d ? "" : b,
            };
          !c && this.$stage.children().css(e), (a.css = e);
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (a) {
          var b =
              (this.width() / this.settings.items).toFixed(3) -
              this.settings.margin,
            c = null,
            d = this._items.length,
            e = !this.settings.autoWidth,
            f = [];
          for (a.items = { merge: !1, width: b }; d--; )
            (c = this._mergers[d]),
              (c =
                (this.settings.mergeFit && Math.min(c, this.settings.items)) ||
                c),
              (a.items.merge = c > 1 || a.items.merge),
              (f[d] = e ? b * c : this._items[d].width());
          this._widths = f;
        },
      },
      {
        filter: ["items", "settings"],
        run: function () {
          var b = [],
            c = this._items,
            d = this.settings,
            e = Math.max(2 * d.items, 4),
            f = 2 * Math.ceil(c.length / 2),
            g = d.loop && c.length ? (d.rewind ? e : Math.max(e, f)) : 0,
            h = "",
            i = "";
          for (g /= 2; g > 0; )
            b.push(this.normalize(b.length / 2, !0)),
              (h += c[b[b.length - 1]][0].outerHTML),
              b.push(this.normalize(c.length - 1 - (b.length - 1) / 2, !0)),
              (i = c[b[b.length - 1]][0].outerHTML + i),
              (g -= 1);
          (this._clones = b),
            a(h).addClass("cloned").appendTo(this.$stage),
            a(i).addClass("cloned").prependTo(this.$stage);
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function () {
          for (
            var a = this.settings.rtl ? 1 : -1,
              b = this._clones.length + this._items.length,
              c = -1,
              d = 0,
              e = 0,
              f = [];
            ++c < b;

          )
            (d = f[c - 1] || 0),
              (e = this._widths[this.relative(c)] + this.settings.margin),
              f.push(d + e * a);
          this._coordinates = f;
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function () {
          var a = this.settings.stagePadding,
            b = this._coordinates,
            c = {
              width: Math.ceil(Math.abs(b[b.length - 1])) + 2 * a,
              "padding-left": a || "",
              "padding-right": a || "",
            };
          this.$stage.css(c);
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (a) {
          var b = this._coordinates.length,
            c = !this.settings.autoWidth,
            d = this.$stage.children();
          if (c && a.items.merge)
            for (; b--; )
              (a.css.width = this._widths[this.relative(b)]),
                d.eq(b).css(a.css);
          else c && ((a.css.width = a.items.width), d.css(a.css));
        },
      },
      {
        filter: ["items"],
        run: function () {
          this._coordinates.length < 1 && this.$stage.removeAttr("style");
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (a) {
          (a.current = a.current ? this.$stage.children().index(a.current) : 0),
            (a.current = Math.max(
              this.minimum(),
              Math.min(this.maximum(), a.current)
            )),
            this.reset(a.current);
        },
      },
      {
        filter: ["position"],
        run: function () {
          this.animate(this.coordinates(this._current));
        },
      },
      {
        filter: ["width", "position", "items", "settings"],
        run: function () {
          var a,
            b,
            c,
            d,
            e = this.settings.rtl ? 1 : -1,
            f = 2 * this.settings.stagePadding,
            g = this.coordinates(this.current()) + f,
            h = g + this.width() * e,
            i = [];
          for (c = 0, d = this._coordinates.length; c < d; c++)
            (a = this._coordinates[c - 1] || 0),
              (b = Math.abs(this._coordinates[c]) + f * e),
              ((this.op(a, "<=", g) && this.op(a, ">", h)) ||
                (this.op(b, "<", g) && this.op(b, ">", h))) &&
                i.push(c);
          this.$stage.children(".active").removeClass("active"),
            this.$stage
              .children(":eq(" + i.join("), :eq(") + ")")
              .addClass("active"),
            this.$stage.children(".center").removeClass("center"),
            this.settings.center &&
              this.$stage.children().eq(this.current()).addClass("center");
        },
      },
    ]),
    (e.prototype.initializeStage = function () {
      (this.$stage = this.$element.find("." + this.settings.stageClass)),
        this.$stage.length ||
          (this.$element.addClass(this.options.loadingClass),
          (this.$stage = a("<" + this.settings.stageElement + ">", {
            class: this.settings.stageClass,
          }).wrap(a("<div/>", { class: this.settings.stageOuterClass }))),
          this.$element.append(this.$stage.parent()));
    }),
    (e.prototype.initializeItems = function () {
      var b = this.$element.find(".owl-item");
      if (b.length)
        return (
          (this._items = b.get().map(function (b) {
            return a(b);
          })),
          (this._mergers = this._items.map(function () {
            return 1;
          })),
          void this.refresh()
        );
      this.replace(this.$element.children().not(this.$stage.parent())),
        this.isVisible() ? this.refresh() : this.invalidate("width"),
        this.$element
          .removeClass(this.options.loadingClass)
          .addClass(this.options.loadedClass);
    }),
    (e.prototype.initialize = function () {
      if (
        (this.enter("initializing"),
        this.trigger("initialize"),
        this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl),
        this.settings.autoWidth && !this.is("pre-loading"))
      ) {
        var a, b, c;
        (a = this.$element.find("img")),
          (b = this.settings.nestedItemSelector
            ? "." + this.settings.nestedItemSelector
            : d),
          (c = this.$element.children(b).width()),
          a.length && c <= 0 && this.preloadAutoWidthImages(a);
      }
      this.initializeStage(),
        this.initializeItems(),
        this.registerEventHandlers(),
        this.leave("initializing"),
        this.trigger("initialized");
    }),
    (e.prototype.isVisible = function () {
      return !this.settings.checkVisibility || this.$element.is(":visible");
    }),
    (e.prototype.setup = function () {
      var b = this.viewport(),
        c = this.options.responsive,
        d = -1,
        e = null;
      c
        ? (a.each(c, function (a) {
            a <= b && a > d && (d = Number(a));
          }),
          (e = a.extend({}, this.options, c[d])),
          "function" == typeof e.stagePadding &&
            (e.stagePadding = e.stagePadding()),
          delete e.responsive,
          e.responsiveClass &&
            this.$element.attr(
              "class",
              this.$element
                .attr("class")
                .replace(
                  new RegExp(
                    "(" + this.options.responsiveClass + "-)\\S+\\s",
                    "g"
                  ),
                  "$1" + d
                )
            ))
        : (e = a.extend({}, this.options)),
        this.trigger("change", { property: { name: "settings", value: e } }),
        (this._breakpoint = d),
        (this.settings = e),
        this.invalidate("settings"),
        this.trigger("changed", {
          property: { name: "settings", value: this.settings },
        });
    }),
    (e.prototype.optionsLogic = function () {
      this.settings.autoWidth &&
        ((this.settings.stagePadding = !1), (this.settings.merge = !1));
    }),
    (e.prototype.prepare = function (b) {
      var c = this.trigger("prepare", { content: b });
      return (
        c.data ||
          (c.data = a("<" + this.settings.itemElement + "/>")
            .addClass(this.options.itemClass)
            .append(b)),
        this.trigger("prepared", { content: c.data }),
        c.data
      );
    }),
    (e.prototype.update = function () {
      for (
        var b = 0,
          c = this._pipe.length,
          d = a.proxy(function (a) {
            return this[a];
          }, this._invalidated),
          e = {};
        b < c;

      )
        (this._invalidated.all || a.grep(this._pipe[b].filter, d).length > 0) &&
          this._pipe[b].run(e),
          b++;
      (this._invalidated = {}), !this.is("valid") && this.enter("valid");
    }),
    (e.prototype.width = function (a) {
      switch ((a = a || e.Width.Default)) {
        case e.Width.Inner:
        case e.Width.Outer:
          return this._width;
        default:
          return (
            this._width - 2 * this.settings.stagePadding + this.settings.margin
          );
      }
    }),
    (e.prototype.refresh = function () {
      this.enter("refreshing"),
        this.trigger("refresh"),
        this.setup(),
        this.optionsLogic(),
        this.$element.addClass(this.options.refreshClass),
        this.update(),
        this.$element.removeClass(this.options.refreshClass),
        this.leave("refreshing"),
        this.trigger("refreshed");
    }),
    (e.prototype.onThrottledResize = function () {
      b.clearTimeout(this.resizeTimer),
        (this.resizeTimer = b.setTimeout(
          this._handlers.onResize,
          this.settings.responsiveRefreshRate
        ));
    }),
    (e.prototype.onResize = function () {
      return (
        !!this._items.length &&
        this._width !== this.$element.width() &&
        !!this.isVisible() &&
        (this.enter("resizing"),
        this.trigger("resize").isDefaultPrevented()
          ? (this.leave("resizing"), !1)
          : (this.invalidate("width"),
            this.refresh(),
            this.leave("resizing"),
            void this.trigger("resized")))
      );
    }),
    (e.prototype.registerEventHandlers = function () {
      a.support.transition &&
        this.$stage.on(
          a.support.transition.end + ".owl.core",
          a.proxy(this.onTransitionEnd, this)
        ),
        !1 !== this.settings.responsive &&
          this.on(b, "resize", this._handlers.onThrottledResize),
        this.settings.mouseDrag &&
          (this.$element.addClass(this.options.dragClass),
          this.$stage.on("mousedown.owl.core", a.proxy(this.onDragStart, this)),
          this.$stage.on(
            "dragstart.owl.core selectstart.owl.core",
            function () {
              return !1;
            }
          )),
        this.settings.touchDrag &&
          (this.$stage.on(
            "touchstart.owl.core",
            a.proxy(this.onDragStart, this)
          ),
          this.$stage.on(
            "touchcancel.owl.core",
            a.proxy(this.onDragEnd, this)
          ));
    }),
    (e.prototype.onDragStart = function (b) {
      var d = null;
      3 !== b.which &&
        (a.support.transform
          ? ((d = this.$stage
              .css("transform")
              .replace(/.*\(|\)| /g, "")
              .split(",")),
            (d = {
              x: d[16 === d.length ? 12 : 4],
              y: d[16 === d.length ? 13 : 5],
            }))
          : ((d = this.$stage.position()),
            (d = {
              x: this.settings.rtl
                ? d.left +
                  this.$stage.width() -
                  this.width() +
                  this.settings.margin
                : d.left,
              y: d.top,
            })),
        this.is("animating") &&
          (a.support.transform ? this.animate(d.x) : this.$stage.stop(),
          this.invalidate("position")),
        this.$element.toggleClass(
          this.options.grabClass,
          "mousedown" === b.type
        ),
        this.speed(0),
        (this._drag.time = new Date().getTime()),
        (this._drag.target = a(b.target)),
        (this._drag.stage.start = d),
        (this._drag.stage.current = d),
        (this._drag.pointer = this.pointer(b)),
        a(c).on(
          "mouseup.owl.core touchend.owl.core",
          a.proxy(this.onDragEnd, this)
        ),
        a(c).one(
          "mousemove.owl.core touchmove.owl.core",
          a.proxy(function (b) {
            var d = this.difference(this._drag.pointer, this.pointer(b));
            a(c).on(
              "mousemove.owl.core touchmove.owl.core",
              a.proxy(this.onDragMove, this)
            ),
              (Math.abs(d.x) < Math.abs(d.y) && this.is("valid")) ||
                (b.preventDefault(),
                this.enter("dragging"),
                this.trigger("drag"));
          }, this)
        ));
    }),
    (e.prototype.onDragMove = function (a) {
      var b = null,
        c = null,
        d = null,
        e = this.difference(this._drag.pointer, this.pointer(a)),
        f = this.difference(this._drag.stage.start, e);
      this.is("dragging") &&
        (a.preventDefault(),
        this.settings.loop
          ? ((b = this.coordinates(this.minimum())),
            (c = this.coordinates(this.maximum() + 1) - b),
            (f.x = ((((f.x - b) % c) + c) % c) + b))
          : ((b = this.settings.rtl
              ? this.coordinates(this.maximum())
              : this.coordinates(this.minimum())),
            (c = this.settings.rtl
              ? this.coordinates(this.minimum())
              : this.coordinates(this.maximum())),
            (d = this.settings.pullDrag ? (-1 * e.x) / 5 : 0),
            (f.x = Math.max(Math.min(f.x, b + d), c + d))),
        (this._drag.stage.current = f),
        this.animate(f.x));
    }),
    (e.prototype.onDragEnd = function (b) {
      var d = this.difference(this._drag.pointer, this.pointer(b)),
        e = this._drag.stage.current,
        f = (d.x > 0) ^ this.settings.rtl ? "left" : "right";
      a(c).off(".owl.core"),
        this.$element.removeClass(this.options.grabClass),
        ((0 !== d.x && this.is("dragging")) || !this.is("valid")) &&
          (this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed),
          this.current(this.closest(e.x, 0 !== d.x ? f : this._drag.direction)),
          this.invalidate("position"),
          this.update(),
          (this._drag.direction = f),
          (Math.abs(d.x) > 3 || new Date().getTime() - this._drag.time > 300) &&
            this._drag.target.one("click.owl.core", function () {
              return !1;
            })),
        this.is("dragging") &&
          (this.leave("dragging"), this.trigger("dragged"));
    }),
    (e.prototype.closest = function (b, c) {
      var e = -1,
        f = 30,
        g = this.width(),
        h = this.coordinates();
      return (
        this.settings.freeDrag ||
          a.each(
            h,
            a.proxy(function (a, i) {
              return (
                "left" === c && b > i - f && b < i + f
                  ? (e = a)
                  : "right" === c && b > i - g - f && b < i - g + f
                  ? (e = a + 1)
                  : this.op(b, "<", i) &&
                    this.op(b, ">", h[a + 1] !== d ? h[a + 1] : i - g) &&
                    (e = "left" === c ? a + 1 : a),
                -1 === e
              );
            }, this)
          ),
        this.settings.loop ||
          (this.op(b, ">", h[this.minimum()])
            ? (e = b = this.minimum())
            : this.op(b, "<", h[this.maximum()]) && (e = b = this.maximum())),
        e
      );
    }),
    (e.prototype.animate = function (b) {
      var c = this.speed() > 0;
      this.is("animating") && this.onTransitionEnd(),
        c && (this.enter("animating"), this.trigger("translate")),
        a.support.transform3d && a.support.transition
          ? this.$stage.css({
              transform: "translate3d(" + b + "px,0px,0px)",
              transition:
                this.speed() / 1e3 +
                "s" +
                (this.settings.slideTransition
                  ? " " + this.settings.slideTransition
                  : ""),
            })
          : c
          ? this.$stage.animate(
              { left: b + "px" },
              this.speed(),
              this.settings.fallbackEasing,
              a.proxy(this.onTransitionEnd, this)
            )
          : this.$stage.css({ left: b + "px" });
    }),
    (e.prototype.is = function (a) {
      return this._states.current[a] && this._states.current[a] > 0;
    }),
    (e.prototype.current = function (a) {
      if (a === d) return this._current;
      if (0 === this._items.length) return d;
      if (((a = this.normalize(a)), this._current !== a)) {
        var b = this.trigger("change", {
          property: { name: "position", value: a },
        });
        b.data !== d && (a = this.normalize(b.data)),
          (this._current = a),
          this.invalidate("position"),
          this.trigger("changed", {
            property: { name: "position", value: this._current },
          });
      }
      return this._current;
    }),
    (e.prototype.invalidate = function (b) {
      return (
        "string" === a.type(b) &&
          ((this._invalidated[b] = !0),
          this.is("valid") && this.leave("valid")),
        a.map(this._invalidated, function (a, b) {
          return b;
        })
      );
    }),
    (e.prototype.reset = function (a) {
      (a = this.normalize(a)) !== d &&
        ((this._speed = 0),
        (this._current = a),
        this.suppress(["translate", "translated"]),
        this.animate(this.coordinates(a)),
        this.release(["translate", "translated"]));
    }),
    (e.prototype.normalize = function (a, b) {
      var c = this._items.length,
        e = b ? 0 : this._clones.length;
      return (
        !this.isNumeric(a) || c < 1
          ? (a = d)
          : (a < 0 || a >= c + e) &&
            (a = ((((a - e / 2) % c) + c) % c) + e / 2),
        a
      );
    }),
    (e.prototype.relative = function (a) {
      return (a -= this._clones.length / 2), this.normalize(a, !0);
    }),
    (e.prototype.maximum = function (a) {
      var b,
        c,
        d,
        e = this.settings,
        f = this._coordinates.length;
      if (e.loop) f = this._clones.length / 2 + this._items.length - 1;
      else if (e.autoWidth || e.merge) {
        if ((b = this._items.length))
          for (
            c = this._items[--b].width(), d = this.$element.width();
            b-- && !((c += this._items[b].width() + this.settings.margin) > d);

          );
        f = b + 1;
      } else
        f = e.center ? this._items.length - 1 : this._items.length - e.items;
      return a && (f -= this._clones.length / 2), Math.max(f, 0);
    }),
    (e.prototype.minimum = function (a) {
      return a ? 0 : this._clones.length / 2;
    }),
    (e.prototype.items = function (a) {
      return a === d
        ? this._items.slice()
        : ((a = this.normalize(a, !0)), this._items[a]);
    }),
    (e.prototype.mergers = function (a) {
      return a === d
        ? this._mergers.slice()
        : ((a = this.normalize(a, !0)), this._mergers[a]);
    }),
    (e.prototype.clones = function (b) {
      var c = this._clones.length / 2,
        e = c + this._items.length,
        f = function (a) {
          return a % 2 == 0 ? e + a / 2 : c - (a + 1) / 2;
        };
      return b === d
        ? a.map(this._clones, function (a, b) {
            return f(b);
          })
        : a.map(this._clones, function (a, c) {
            return a === b ? f(c) : null;
          });
    }),
    (e.prototype.speed = function (a) {
      return a !== d && (this._speed = a), this._speed;
    }),
    (e.prototype.coordinates = function (b) {
      var c,
        e = 1,
        f = b - 1;
      return b === d
        ? a.map(
            this._coordinates,
            a.proxy(function (a, b) {
              return this.coordinates(b);
            }, this)
          )
        : (this.settings.center
            ? (this.settings.rtl && ((e = -1), (f = b + 1)),
              (c = this._coordinates[b]),
              (c += ((this.width() - c + (this._coordinates[f] || 0)) / 2) * e))
            : (c = this._coordinates[f] || 0),
          (c = Math.ceil(c)));
    }),
    (e.prototype.duration = function (a, b, c) {
      return 0 === c
        ? 0
        : Math.min(Math.max(Math.abs(b - a), 1), 6) *
            Math.abs(c || this.settings.smartSpeed);
    }),
    (e.prototype.to = function (a, b) {
      var c = this.current(),
        d = null,
        e = a - this.relative(c),
        f = (e > 0) - (e < 0),
        g = this._items.length,
        h = this.minimum(),
        i = this.maximum();
      this.settings.loop
        ? (!this.settings.rewind && Math.abs(e) > g / 2 && (e += -1 * f * g),
          (a = c + e),
          (d = ((((a - h) % g) + g) % g) + h) !== a &&
            d - e <= i &&
            d - e > 0 &&
            ((c = d - e), (a = d), this.reset(c)))
        : this.settings.rewind
        ? ((i += 1), (a = ((a % i) + i) % i))
        : (a = Math.max(h, Math.min(i, a))),
        this.speed(this.duration(c, a, b)),
        this.current(a),
        this.isVisible() && this.update();
    }),
    (e.prototype.next = function (a) {
      (a = a || !1), this.to(this.relative(this.current()) + 1, a);
    }),
    (e.prototype.prev = function (a) {
      (a = a || !1), this.to(this.relative(this.current()) - 1, a);
    }),
    (e.prototype.onTransitionEnd = function (a) {
      if (
        a !== d &&
        (a.stopPropagation(),
        (a.target || a.srcElement || a.originalTarget) !== this.$stage.get(0))
      )
        return !1;
      this.leave("animating"), this.trigger("translated");
    }),
    (e.prototype.viewport = function () {
      var d;
      return (
        this.options.responsiveBaseElement !== b
          ? (d = a(this.options.responsiveBaseElement).width())
          : b.innerWidth
          ? (d = b.innerWidth)
          : c.documentElement && c.documentElement.clientWidth
          ? (d = c.documentElement.clientWidth)
          : console.warn("Can not detect viewport width."),
        d
      );
    }),
    (e.prototype.replace = function (b) {
      this.$stage.empty(),
        (this._items = []),
        b && (b = b instanceof jQuery ? b : a(b)),
        this.settings.nestedItemSelector &&
          (b = b.find("." + this.settings.nestedItemSelector)),
        b
          .filter(function () {
            return 1 === this.nodeType;
          })
          .each(
            a.proxy(function (a, b) {
              (b = this.prepare(b)),
                this.$stage.append(b),
                this._items.push(b),
                this._mergers.push(
                  1 *
                    b
                      .find("[data-merge]")
                      .addBack("[data-merge]")
                      .attr("data-merge") || 1
                );
            }, this)
          ),
        this.reset(
          this.isNumeric(this.settings.startPosition)
            ? this.settings.startPosition
            : 0
        ),
        this.invalidate("items");
    }),
    (e.prototype.add = function (b, c) {
      var e = this.relative(this._current);
      (c = c === d ? this._items.length : this.normalize(c, !0)),
        (b = b instanceof jQuery ? b : a(b)),
        this.trigger("add", { content: b, position: c }),
        (b = this.prepare(b)),
        0 === this._items.length || c === this._items.length
          ? (0 === this._items.length && this.$stage.append(b),
            0 !== this._items.length && this._items[c - 1].after(b),
            this._items.push(b),
            this._mergers.push(
              1 *
                b
                  .find("[data-merge]")
                  .addBack("[data-merge]")
                  .attr("data-merge") || 1
            ))
          : (this._items[c].before(b),
            this._items.splice(c, 0, b),
            this._mergers.splice(
              c,
              0,
              1 *
                b
                  .find("[data-merge]")
                  .addBack("[data-merge]")
                  .attr("data-merge") || 1
            )),
        this._items[e] && this.reset(this._items[e].index()),
        this.invalidate("items"),
        this.trigger("added", { content: b, position: c });
    }),
    (e.prototype.remove = function (a) {
      (a = this.normalize(a, !0)) !== d &&
        (this.trigger("remove", { content: this._items[a], position: a }),
        this._items[a].remove(),
        this._items.splice(a, 1),
        this._mergers.splice(a, 1),
        this.invalidate("items"),
        this.trigger("removed", { content: null, position: a }));
    }),
    (e.prototype.preloadAutoWidthImages = function (b) {
      b.each(
        a.proxy(function (b, c) {
          this.enter("pre-loading"),
            (c = a(c)),
            a(new Image())
              .one(
                "load",
                a.proxy(function (a) {
                  c.attr("src", a.target.src),
                    c.css("opacity", 1),
                    this.leave("pre-loading"),
                    !this.is("pre-loading") &&
                      !this.is("initializing") &&
                      this.refresh();
                }, this)
              )
              .attr(
                "src",
                c.attr("src") || c.attr("data-src") || c.attr("data-src-retina")
              );
        }, this)
      );
    }),
    (e.prototype.destroy = function () {
      this.$element.off(".owl.core"),
        this.$stage.off(".owl.core"),
        a(c).off(".owl.core"),
        !1 !== this.settings.responsive &&
          (b.clearTimeout(this.resizeTimer),
          this.off(b, "resize", this._handlers.onThrottledResize));
      for (var d in this._plugins) this._plugins[d].destroy();
      this.$stage.children(".cloned").remove(),
        this.$stage.unwrap(),
        this.$stage.children().contents().unwrap(),
        this.$stage.children().unwrap(),
        this.$stage.remove(),
        this.$element
          .removeClass(this.options.refreshClass)
          .removeClass(this.options.loadingClass)
          .removeClass(this.options.loadedClass)
          .removeClass(this.options.rtlClass)
          .removeClass(this.options.dragClass)
          .removeClass(this.options.grabClass)
          .attr(
            "class",
            this.$element
              .attr("class")
              .replace(
                new RegExp(this.options.responsiveClass + "-\\S+\\s", "g"),
                ""
              )
          )
          .removeData("owl.carousel");
    }),
    (e.prototype.op = function (a, b, c) {
      var d = this.settings.rtl;
      switch (b) {
        case "<":
          return d ? a > c : a < c;
        case ">":
          return d ? a < c : a > c;
        case ">=":
          return d ? a <= c : a >= c;
        case "<=":
          return d ? a >= c : a <= c;
      }
    }),
    (e.prototype.on = function (a, b, c, d) {
      a.addEventListener
        ? a.addEventListener(b, c, d)
        : a.attachEvent && a.attachEvent("on" + b, c);
    }),
    (e.prototype.off = function (a, b, c, d) {
      a.removeEventListener
        ? a.removeEventListener(b, c, d)
        : a.detachEvent && a.detachEvent("on" + b, c);
    }),
    (e.prototype.trigger = function (b, c, d, f, g) {
      var h = { item: { count: this._items.length, index: this.current() } },
        i = a.camelCase(
          a
            .grep(["on", b, d], function (a) {
              return a;
            })
            .join("-")
            .toLowerCase()
        ),
        j = a.Event(
          [b, "owl", d || "carousel"].join(".").toLowerCase(),
          a.extend({ relatedTarget: this }, h, c)
        );
      return (
        this._supress[b] ||
          (a.each(this._plugins, function (a, b) {
            b.onTrigger && b.onTrigger(j);
          }),
          this.register({ type: e.Type.Event, name: b }),
          this.$element.trigger(j),
          this.settings &&
            "function" == typeof this.settings[i] &&
            this.settings[i].call(this, j)),
        j
      );
    }),
    (e.prototype.enter = function (b) {
      a.each(
        [b].concat(this._states.tags[b] || []),
        a.proxy(function (a, b) {
          this._states.current[b] === d && (this._states.current[b] = 0),
            this._states.current[b]++;
        }, this)
      );
    }),
    (e.prototype.leave = function (b) {
      a.each(
        [b].concat(this._states.tags[b] || []),
        a.proxy(function (a, b) {
          this._states.current[b]--;
        }, this)
      );
    }),
    (e.prototype.register = function (b) {
      if (b.type === e.Type.Event) {
        if (
          (a.event.special[b.name] || (a.event.special[b.name] = {}),
          !a.event.special[b.name].owl)
        ) {
          var c = a.event.special[b.name]._default;
          (a.event.special[b.name]._default = function (a) {
            return !c ||
              !c.apply ||
              (a.namespace && -1 !== a.namespace.indexOf("owl"))
              ? a.namespace && a.namespace.indexOf("owl") > -1
              : c.apply(this, arguments);
          }),
            (a.event.special[b.name].owl = !0);
        }
      } else
        b.type === e.Type.State &&
          (this._states.tags[b.name]
            ? (this._states.tags[b.name] = this._states.tags[b.name].concat(
                b.tags
              ))
            : (this._states.tags[b.name] = b.tags),
          (this._states.tags[b.name] = a.grep(
            this._states.tags[b.name],
            a.proxy(function (c, d) {
              return a.inArray(c, this._states.tags[b.name]) === d;
            }, this)
          )));
    }),
    (e.prototype.suppress = function (b) {
      a.each(
        b,
        a.proxy(function (a, b) {
          this._supress[b] = !0;
        }, this)
      );
    }),
    (e.prototype.release = function (b) {
      a.each(
        b,
        a.proxy(function (a, b) {
          delete this._supress[b];
        }, this)
      );
    }),
    (e.prototype.pointer = function (a) {
      var c = { x: null, y: null };
      return (
        (a = a.originalEvent || a || b.event),
        (a =
          a.touches && a.touches.length
            ? a.touches[0]
            : a.changedTouches && a.changedTouches.length
            ? a.changedTouches[0]
            : a),
        a.pageX
          ? ((c.x = a.pageX), (c.y = a.pageY))
          : ((c.x = a.clientX), (c.y = a.clientY)),
        c
      );
    }),
    (e.prototype.isNumeric = function (a) {
      return !isNaN(parseFloat(a));
    }),
    (e.prototype.difference = function (a, b) {
      return { x: a.x - b.x, y: a.y - b.y };
    }),
    (a.fn.owlCarousel = function (b) {
      var c = Array.prototype.slice.call(arguments, 1);
      return this.each(function () {
        var d = a(this),
          f = d.data("owl.carousel");
        f ||
          ((f = new e(this, "object" == typeof b && b)),
          d.data("owl.carousel", f),
          a.each(
            [
              "next",
              "prev",
              "to",
              "destroy",
              "refresh",
              "replace",
              "add",
              "remove",
            ],
            function (b, c) {
              f.register({ type: e.Type.Event, name: c }),
                f.$element.on(
                  c + ".owl.carousel.core",
                  a.proxy(function (a) {
                    a.namespace &&
                      a.relatedTarget !== this &&
                      (this.suppress([c]),
                      f[c].apply(this, [].slice.call(arguments, 1)),
                      this.release([c]));
                  }, f)
                );
            }
          )),
          "string" == typeof b && "_" !== b.charAt(0) && f[b].apply(f, c);
      });
    }),
    (a.fn.owlCarousel.Constructor = e);
})(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    var e = function (b) {
      (this._core = b),
        (this._interval = null),
        (this._visible = null),
        (this._handlers = {
          "initialized.owl.carousel": a.proxy(function (a) {
            a.namespace && this._core.settings.autoRefresh && this.watch();
          }, this),
        }),
        (this._core.options = a.extend({}, e.Defaults, this._core.options)),
        this._core.$element.on(this._handlers);
    };
    (e.Defaults = { autoRefresh: !0, autoRefreshInterval: 500 }),
      (e.prototype.watch = function () {
        this._interval ||
          ((this._visible = this._core.isVisible()),
          (this._interval = b.setInterval(
            a.proxy(this.refresh, this),
            this._core.settings.autoRefreshInterval
          )));
      }),
      (e.prototype.refresh = function () {
        this._core.isVisible() !== this._visible &&
          ((this._visible = !this._visible),
          this._core.$element.toggleClass("owl-hidden", !this._visible),
          this._visible &&
            this._core.invalidate("width") &&
            this._core.refresh());
      }),
      (e.prototype.destroy = function () {
        var a, c;
        b.clearInterval(this._interval);
        for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
        for (c in Object.getOwnPropertyNames(this))
          "function" != typeof this[c] && (this[c] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.AutoRefresh = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    var e = function (b) {
      (this._core = b),
        (this._loaded = []),
        (this._handlers = {
          "initialized.owl.carousel change.owl.carousel resized.owl.carousel":
            a.proxy(function (b) {
              if (
                b.namespace &&
                this._core.settings &&
                this._core.settings.lazyLoad &&
                ((b.property && "position" == b.property.name) ||
                  "initialized" == b.type)
              ) {
                var c = this._core.settings,
                  e = (c.center && Math.ceil(c.items / 2)) || c.items,
                  f = (c.center && -1 * e) || 0,
                  g =
                    (b.property && b.property.value !== d
                      ? b.property.value
                      : this._core.current()) + f,
                  h = this._core.clones().length,
                  i = a.proxy(function (a, b) {
                    this.load(b);
                  }, this);
                for (
                  c.lazyLoadEager > 0 &&
                  ((e += c.lazyLoadEager),
                  c.loop && ((g -= c.lazyLoadEager), e++));
                  f++ < e;

                )
                  this.load(h / 2 + this._core.relative(g)),
                    h && a.each(this._core.clones(this._core.relative(g)), i),
                    g++;
              }
            }, this),
        }),
        (this._core.options = a.extend({}, e.Defaults, this._core.options)),
        this._core.$element.on(this._handlers);
    };
    (e.Defaults = { lazyLoad: !1, lazyLoadEager: 0 }),
      (e.prototype.load = function (c) {
        var d = this._core.$stage.children().eq(c),
          e = d && d.find(".owl-lazy");
        !e ||
          a.inArray(d.get(0), this._loaded) > -1 ||
          (e.each(
            a.proxy(function (c, d) {
              var e,
                f = a(d),
                g =
                  (b.devicePixelRatio > 1 && f.attr("data-src-retina")) ||
                  f.attr("data-src") ||
                  f.attr("data-srcset");
              this._core.trigger("load", { element: f, url: g }, "lazy"),
                f.is("img")
                  ? f
                      .one(
                        "load.owl.lazy",
                        a.proxy(function () {
                          f.css("opacity", 1),
                            this._core.trigger(
                              "loaded",
                              { element: f, url: g },
                              "lazy"
                            );
                        }, this)
                      )
                      .attr("src", g)
                  : f.is("source")
                  ? f
                      .one(
                        "load.owl.lazy",
                        a.proxy(function () {
                          this._core.trigger(
                            "loaded",
                            { element: f, url: g },
                            "lazy"
                          );
                        }, this)
                      )
                      .attr("srcset", g)
                  : ((e = new Image()),
                    (e.onload = a.proxy(function () {
                      f.css({
                        "background-image": 'url("' + g + '")',
                        opacity: "1",
                      }),
                        this._core.trigger(
                          "loaded",
                          { element: f, url: g },
                          "lazy"
                        );
                    }, this)),
                    (e.src = g));
            }, this)
          ),
          this._loaded.push(d.get(0)));
      }),
      (e.prototype.destroy = function () {
        var a, b;
        for (a in this.handlers) this._core.$element.off(a, this.handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
          "function" != typeof this[b] && (this[b] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.Lazy = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    var e = function (c) {
      (this._core = c),
        (this._previousHeight = null),
        (this._handlers = {
          "initialized.owl.carousel refreshed.owl.carousel": a.proxy(function (
            a
          ) {
            a.namespace && this._core.settings.autoHeight && this.update();
          },
          this),
          "changed.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._core.settings.autoHeight &&
              "position" === a.property.name &&
              this.update();
          }, this),
          "loaded.owl.lazy": a.proxy(function (a) {
            a.namespace &&
              this._core.settings.autoHeight &&
              a.element.closest("." + this._core.settings.itemClass).index() ===
                this._core.current() &&
              this.update();
          }, this),
        }),
        (this._core.options = a.extend({}, e.Defaults, this._core.options)),
        this._core.$element.on(this._handlers),
        (this._intervalId = null);
      var d = this;
      a(b).on("load", function () {
        d._core.settings.autoHeight && d.update();
      }),
        a(b).resize(function () {
          d._core.settings.autoHeight &&
            (null != d._intervalId && clearTimeout(d._intervalId),
            (d._intervalId = setTimeout(function () {
              d.update();
            }, 250)));
        });
    };
    (e.Defaults = { autoHeight: !1, autoHeightClass: "owl-height" }),
      (e.prototype.update = function () {
        var b = this._core._current,
          c = b + this._core.settings.items,
          d = this._core.settings.lazyLoad,
          e = this._core.$stage.children().toArray().slice(b, c),
          f = [],
          g = 0;
        a.each(e, function (b, c) {
          f.push(a(c).height());
        }),
          (g = Math.max.apply(null, f)),
          g <= 1 && d && this._previousHeight && (g = this._previousHeight),
          (this._previousHeight = g),
          this._core.$stage
            .parent()
            .height(g)
            .addClass(this._core.settings.autoHeightClass);
      }),
      (e.prototype.destroy = function () {
        var a, b;
        for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
          "function" != typeof this[b] && (this[b] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.AutoHeight = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    var e = function (b) {
      (this._core = b),
        (this._videos = {}),
        (this._playing = null),
        (this._handlers = {
          "initialized.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._core.register({
                type: "state",
                name: "playing",
                tags: ["interacting"],
              });
          }, this),
          "resize.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._core.settings.video &&
              this.isInFullScreen() &&
              a.preventDefault();
          }, this),
          "refreshed.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._core.is("resizing") &&
              this._core.$stage.find(".cloned .owl-video-frame").remove();
          }, this),
          "changed.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              "position" === a.property.name &&
              this._playing &&
              this.stop();
          }, this),
          "prepared.owl.carousel": a.proxy(function (b) {
            if (b.namespace) {
              var c = a(b.content).find(".owl-video");
              c.length &&
                (c.css("display", "none"), this.fetch(c, a(b.content)));
            }
          }, this),
        }),
        (this._core.options = a.extend({}, e.Defaults, this._core.options)),
        this._core.$element.on(this._handlers),
        this._core.$element.on(
          "click.owl.video",
          ".owl-video-play-icon",
          a.proxy(function (a) {
            this.play(a);
          }, this)
        );
    };
    (e.Defaults = { video: !1, videoHeight: !1, videoWidth: !1 }),
      (e.prototype.fetch = function (a, b) {
        var c = (function () {
            return a.attr("data-vimeo-id")
              ? "vimeo"
              : a.attr("data-vzaar-id")
              ? "vzaar"
              : "youtube";
          })(),
          d =
            a.attr("data-vimeo-id") ||
            a.attr("data-youtube-id") ||
            a.attr("data-vzaar-id"),
          e = a.attr("data-width") || this._core.settings.videoWidth,
          f = a.attr("data-height") || this._core.settings.videoHeight,
          g = a.attr("href");
        if (!g) throw new Error("Missing video URL.");
        if (
          ((d = g.match(
            /(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com|be\-nocookie\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/
          )),
          d[3].indexOf("youtu") > -1)
        )
          c = "youtube";
        else if (d[3].indexOf("vimeo") > -1) c = "vimeo";
        else {
          if (!(d[3].indexOf("vzaar") > -1))
            throw new Error("Video URL not supported.");
          c = "vzaar";
        }
        (d = d[6]),
          (this._videos[g] = { type: c, id: d, width: e, height: f }),
          b.attr("data-video", g),
          this.thumbnail(a, this._videos[g]);
      }),
      (e.prototype.thumbnail = function (b, c) {
        var d,
          e,
          f,
          g =
            c.width && c.height
              ? "width:" + c.width + "px;height:" + c.height + "px;"
              : "",
          h = b.find("img"),
          i = "src",
          j = "",
          k = this._core.settings,
          l = function (c) {
            (e = '<div class="owl-video-play-icon"></div>'),
              (d = k.lazyLoad
                ? a("<div/>", { class: "owl-video-tn " + j, srcType: c })
                : a("<div/>", {
                    class: "owl-video-tn",
                    style: "opacity:1;background-image:url(" + c + ")",
                  })),
              b.after(d),
              b.after(e);
          };
        if (
          (b.wrap(a("<div/>", { class: "owl-video-wrapper", style: g })),
          this._core.settings.lazyLoad && ((i = "data-src"), (j = "owl-lazy")),
          h.length)
        )
          return l(h.attr(i)), h.remove(), !1;
        "youtube" === c.type
          ? ((f = "//img.youtube.com/vi/" + c.id + "/hqdefault.jpg"), l(f))
          : "vimeo" === c.type
          ? a.ajax({
              type: "GET",
              url: "//vimeo.com/api/v2/video/" + c.id + ".json",
              jsonp: "callback",
              dataType: "jsonp",
              success: function (a) {
                (f = a[0].thumbnail_large), l(f);
              },
            })
          : "vzaar" === c.type &&
            a.ajax({
              type: "GET",
              url: "//vzaar.com/api/videos/" + c.id + ".json",
              jsonp: "callback",
              dataType: "jsonp",
              success: function (a) {
                (f = a.framegrab_url), l(f);
              },
            });
      }),
      (e.prototype.stop = function () {
        this._core.trigger("stop", null, "video"),
          this._playing.find(".owl-video-frame").remove(),
          this._playing.removeClass("owl-video-playing"),
          (this._playing = null),
          this._core.leave("playing"),
          this._core.trigger("stopped", null, "video");
      }),
      (e.prototype.play = function (b) {
        var c,
          d = a(b.target),
          e = d.closest("." + this._core.settings.itemClass),
          f = this._videos[e.attr("data-video")],
          g = f.width || "100%",
          h = f.height || this._core.$stage.height();
        this._playing ||
          (this._core.enter("playing"),
          this._core.trigger("play", null, "video"),
          (e = this._core.items(this._core.relative(e.index()))),
          this._core.reset(e.index()),
          (c = a(
            '<iframe frameborder="0" allowfullscreen mozallowfullscreen webkitAllowFullScreen ></iframe>'
          )),
          c.attr("height", h),
          c.attr("width", g),
          "youtube" === f.type
            ? c.attr(
                "src",
                "//www.youtube.com/embed/" +
                  f.id +
                  "?autoplay=1&rel=0&v=" +
                  f.id
              )
            : "vimeo" === f.type
            ? c.attr("src", "//player.vimeo.com/video/" + f.id + "?autoplay=1")
            : "vzaar" === f.type &&
              c.attr(
                "src",
                "//view.vzaar.com/" + f.id + "/player?autoplay=true"
              ),
          a(c)
            .wrap('<div class="owl-video-frame" />')
            .insertAfter(e.find(".owl-video")),
          (this._playing = e.addClass("owl-video-playing")));
      }),
      (e.prototype.isInFullScreen = function () {
        var b =
          c.fullscreenElement ||
          c.mozFullScreenElement ||
          c.webkitFullscreenElement;
        return b && a(b).parent().hasClass("owl-video-frame");
      }),
      (e.prototype.destroy = function () {
        var a, b;
        this._core.$element.off("click.owl.video");
        for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
          "function" != typeof this[b] && (this[b] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.Video = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    var e = function (b) {
      (this.core = b),
        (this.core.options = a.extend({}, e.Defaults, this.core.options)),
        (this.swapping = !0),
        (this.previous = d),
        (this.next = d),
        (this.handlers = {
          "change.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              "position" == a.property.name &&
              ((this.previous = this.core.current()),
              (this.next = a.property.value));
          }, this),
          "drag.owl.carousel dragged.owl.carousel translated.owl.carousel":
            a.proxy(function (a) {
              a.namespace && (this.swapping = "translated" == a.type);
            }, this),
          "translate.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this.swapping &&
              (this.core.options.animateOut || this.core.options.animateIn) &&
              this.swap();
          }, this),
        }),
        this.core.$element.on(this.handlers);
    };
    (e.Defaults = { animateOut: !1, animateIn: !1 }),
      (e.prototype.swap = function () {
        if (
          1 === this.core.settings.items &&
          a.support.animation &&
          a.support.transition
        ) {
          this.core.speed(0);
          var b,
            c = a.proxy(this.clear, this),
            d = this.core.$stage.children().eq(this.previous),
            e = this.core.$stage.children().eq(this.next),
            f = this.core.settings.animateIn,
            g = this.core.settings.animateOut;
          this.core.current() !== this.previous &&
            (g &&
              ((b =
                this.core.coordinates(this.previous) -
                this.core.coordinates(this.next)),
              d
                .one(a.support.animation.end, c)
                .css({ left: b + "px" })
                .addClass("animated owl-animated-out")
                .addClass(g)),
            f &&
              e
                .one(a.support.animation.end, c)
                .addClass("animated owl-animated-in")
                .addClass(f));
        }
      }),
      (e.prototype.clear = function (b) {
        a(b.target)
          .css({ left: "" })
          .removeClass("animated owl-animated-out owl-animated-in")
          .removeClass(this.core.settings.animateIn)
          .removeClass(this.core.settings.animateOut),
          this.core.onTransitionEnd();
      }),
      (e.prototype.destroy = function () {
        var a, b;
        for (a in this.handlers) this.core.$element.off(a, this.handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
          "function" != typeof this[b] && (this[b] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.Animate = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    var e = function (b) {
      (this._core = b),
        (this._call = null),
        (this._time = 0),
        (this._timeout = 0),
        (this._paused = !0),
        (this._handlers = {
          "changed.owl.carousel": a.proxy(function (a) {
            a.namespace && "settings" === a.property.name
              ? this._core.settings.autoplay
                ? this.play()
                : this.stop()
              : a.namespace &&
                "position" === a.property.name &&
                this._paused &&
                (this._time = 0);
          }, this),
          "initialized.owl.carousel": a.proxy(function (a) {
            a.namespace && this._core.settings.autoplay && this.play();
          }, this),
          "play.owl.autoplay": a.proxy(function (a, b, c) {
            a.namespace && this.play(b, c);
          }, this),
          "stop.owl.autoplay": a.proxy(function (a) {
            a.namespace && this.stop();
          }, this),
          "mouseover.owl.autoplay": a.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is("rotating") &&
              this.pause();
          }, this),
          "mouseleave.owl.autoplay": a.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is("rotating") &&
              this.play();
          }, this),
          "touchstart.owl.core": a.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is("rotating") &&
              this.pause();
          }, this),
          "touchend.owl.core": a.proxy(function () {
            this._core.settings.autoplayHoverPause && this.play();
          }, this),
        }),
        this._core.$element.on(this._handlers),
        (this._core.options = a.extend({}, e.Defaults, this._core.options));
    };
    (e.Defaults = {
      autoplay: !1,
      autoplayTimeout: 5e3,
      autoplayHoverPause: !1,
      autoplaySpeed: !1,
    }),
      (e.prototype._next = function (d) {
        (this._call = b.setTimeout(
          a.proxy(this._next, this, d),
          this._timeout * (Math.round(this.read() / this._timeout) + 1) -
            this.read()
        )),
          this._core.is("interacting") ||
            c.hidden ||
            this._core.next(d || this._core.settings.autoplaySpeed);
      }),
      (e.prototype.read = function () {
        return new Date().getTime() - this._time;
      }),
      (e.prototype.play = function (c, d) {
        var e;
        this._core.is("rotating") || this._core.enter("rotating"),
          (c = c || this._core.settings.autoplayTimeout),
          (e = Math.min(this._time % (this._timeout || c), c)),
          this._paused
            ? ((this._time = this.read()), (this._paused = !1))
            : b.clearTimeout(this._call),
          (this._time += (this.read() % c) - e),
          (this._timeout = c),
          (this._call = b.setTimeout(a.proxy(this._next, this, d), c - e));
      }),
      (e.prototype.stop = function () {
        this._core.is("rotating") &&
          ((this._time = 0),
          (this._paused = !0),
          b.clearTimeout(this._call),
          this._core.leave("rotating"));
      }),
      (e.prototype.pause = function () {
        this._core.is("rotating") &&
          !this._paused &&
          ((this._time = this.read()),
          (this._paused = !0),
          b.clearTimeout(this._call));
      }),
      (e.prototype.destroy = function () {
        var a, b;
        this.stop();
        for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
          "function" != typeof this[b] && (this[b] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.autoplay = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    "use strict";
    var e = function (b) {
      (this._core = b),
        (this._initialized = !1),
        (this._pages = []),
        (this._controls = {}),
        (this._templates = []),
        (this.$element = this._core.$element),
        (this._overrides = {
          next: this._core.next,
          prev: this._core.prev,
          to: this._core.to,
        }),
        (this._handlers = {
          "prepared.owl.carousel": a.proxy(function (b) {
            b.namespace &&
              this._core.settings.dotsData &&
              this._templates.push(
                '<div class="' +
                  this._core.settings.dotClass +
                  '">' +
                  a(b.content)
                    .find("[data-dot]")
                    .addBack("[data-dot]")
                    .attr("data-dot") +
                  "</div>"
              );
          }, this),
          "added.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._core.settings.dotsData &&
              this._templates.splice(a.position, 0, this._templates.pop());
          }, this),
          "remove.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._core.settings.dotsData &&
              this._templates.splice(a.position, 1);
          }, this),
          "changed.owl.carousel": a.proxy(function (a) {
            a.namespace && "position" == a.property.name && this.draw();
          }, this),
          "initialized.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              !this._initialized &&
              (this._core.trigger("initialize", null, "navigation"),
              this.initialize(),
              this.update(),
              this.draw(),
              (this._initialized = !0),
              this._core.trigger("initialized", null, "navigation"));
          }, this),
          "refreshed.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._initialized &&
              (this._core.trigger("refresh", null, "navigation"),
              this.update(),
              this.draw(),
              this._core.trigger("refreshed", null, "navigation"));
          }, this),
        }),
        (this._core.options = a.extend({}, e.Defaults, this._core.options)),
        this.$element.on(this._handlers);
    };
    (e.Defaults = {
      nav: !1,
      navText: [
        '<span aria-label="Previous">&#x2039;</span>',
        '<span aria-label="Next">&#x203a;</span>',
      ],
      navSpeed: !1,
      navElement: 'button type="button" role="presentation"',
      navContainer: !1,
      navContainerClass: "owl-nav",
      navClass: ["owl-prev", "owl-next"],
      slideBy: 1,
      dotClass: "owl-dot",
      dotsClass: "owl-dots",
      dots: !0,
      dotsEach: !1,
      dotsData: !1,
      dotsSpeed: !1,
      dotsContainer: !1,
    }),
      (e.prototype.initialize = function () {
        var b,
          c = this._core.settings;
        (this._controls.$relative = (
          c.navContainer
            ? a(c.navContainer)
            : a("<div>").addClass(c.navContainerClass).appendTo(this.$element)
        ).addClass("disabled")),
          (this._controls.$previous = a("<" + c.navElement + ">")
            .addClass(c.navClass[0])
            .html(c.navText[0])
            .prependTo(this._controls.$relative)
            .on(
              "click",
              a.proxy(function (a) {
                this.prev(c.navSpeed);
              }, this)
            )),
          (this._controls.$next = a("<" + c.navElement + ">")
            .addClass(c.navClass[1])
            .html(c.navText[1])
            .appendTo(this._controls.$relative)
            .on(
              "click",
              a.proxy(function (a) {
                this.next(c.navSpeed);
              }, this)
            )),
          c.dotsData ||
            (this._templates = [
              a('<button role="button">')
                .addClass(c.dotClass)
                .append(a("<span>"))
                .prop("outerHTML"),
            ]),
          (this._controls.$absolute = (
            c.dotsContainer
              ? a(c.dotsContainer)
              : a("<div>").addClass(c.dotsClass).appendTo(this.$element)
          ).addClass("disabled")),
          this._controls.$absolute.on(
            "click",
            "button",
            a.proxy(function (b) {
              var d = a(b.target).parent().is(this._controls.$absolute)
                ? a(b.target).index()
                : a(b.target).parent().index();
              b.preventDefault(), this.to(d, c.dotsSpeed);
            }, this)
          );
        for (b in this._overrides) this._core[b] = a.proxy(this[b], this);
      }),
      (e.prototype.destroy = function () {
        var a, b, c, d, e;
        e = this._core.settings;
        for (a in this._handlers) this.$element.off(a, this._handlers[a]);
        for (b in this._controls)
          "$relative" === b && e.navContainer
            ? this._controls[b].html("")
            : this._controls[b].remove();
        for (d in this.overides) this._core[d] = this._overrides[d];
        for (c in Object.getOwnPropertyNames(this))
          "function" != typeof this[c] && (this[c] = null);
      }),
      (e.prototype.update = function () {
        var a,
          b,
          c,
          d = this._core.clones().length / 2,
          e = d + this._core.items().length,
          f = this._core.maximum(!0),
          g = this._core.settings,
          h = g.center || g.autoWidth || g.dotsData ? 1 : g.dotsEach || g.items;
        if (
          ("page" !== g.slideBy && (g.slideBy = Math.min(g.slideBy, g.items)),
          g.dots || "page" == g.slideBy)
        )
          for (this._pages = [], a = d, b = 0, c = 0; a < e; a++) {
            if (b >= h || 0 === b) {
              if (
                (this._pages.push({
                  start: Math.min(f, a - d),
                  end: a - d + h - 1,
                }),
                Math.min(f, a - d) === f)
              )
                break;
              (b = 0), ++c;
            }
            b += this._core.mergers(this._core.relative(a));
          }
      }),
      (e.prototype.draw = function () {
        var b,
          c = this._core.settings,
          d = this._core.items().length <= c.items,
          e = this._core.relative(this._core.current()),
          f = c.loop || c.rewind;
        this._controls.$relative.toggleClass("disabled", !c.nav || d),
          c.nav &&
            (this._controls.$previous.toggleClass(
              "disabled",
              !f && e <= this._core.minimum(!0)
            ),
            this._controls.$next.toggleClass(
              "disabled",
              !f && e >= this._core.maximum(!0)
            )),
          this._controls.$absolute.toggleClass("disabled", !c.dots || d),
          c.dots &&
            ((b =
              this._pages.length - this._controls.$absolute.children().length),
            c.dotsData && 0 !== b
              ? this._controls.$absolute.html(this._templates.join(""))
              : b > 0
              ? this._controls.$absolute.append(
                  new Array(b + 1).join(this._templates[0])
                )
              : b < 0 && this._controls.$absolute.children().slice(b).remove(),
            this._controls.$absolute.find(".active").removeClass("active"),
            this._controls.$absolute
              .children()
              .eq(a.inArray(this.current(), this._pages))
              .addClass("active"));
      }),
      (e.prototype.onTrigger = function (b) {
        var c = this._core.settings;
        b.page = {
          index: a.inArray(this.current(), this._pages),
          count: this._pages.length,
          size:
            c &&
            (c.center || c.autoWidth || c.dotsData ? 1 : c.dotsEach || c.items),
        };
      }),
      (e.prototype.current = function () {
        var b = this._core.relative(this._core.current());
        return a
          .grep(
            this._pages,
            a.proxy(function (a, c) {
              return a.start <= b && a.end >= b;
            }, this)
          )
          .pop();
      }),
      (e.prototype.getPosition = function (b) {
        var c,
          d,
          e = this._core.settings;
        return (
          "page" == e.slideBy
            ? ((c = a.inArray(this.current(), this._pages)),
              (d = this._pages.length),
              b ? ++c : --c,
              (c = this._pages[((c % d) + d) % d].start))
            : ((c = this._core.relative(this._core.current())),
              (d = this._core.items().length),
              b ? (c += e.slideBy) : (c -= e.slideBy)),
          c
        );
      }),
      (e.prototype.next = function (b) {
        a.proxy(this._overrides.to, this._core)(this.getPosition(!0), b);
      }),
      (e.prototype.prev = function (b) {
        a.proxy(this._overrides.to, this._core)(this.getPosition(!1), b);
      }),
      (e.prototype.to = function (b, c, d) {
        var e;
        !d && this._pages.length
          ? ((e = this._pages.length),
            a.proxy(this._overrides.to, this._core)(
              this._pages[((b % e) + e) % e].start,
              c
            ))
          : a.proxy(this._overrides.to, this._core)(b, c);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.Navigation = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    "use strict";
    var e = function (c) {
      (this._core = c),
        (this._hashes = {}),
        (this.$element = this._core.$element),
        (this._handlers = {
          "initialized.owl.carousel": a.proxy(function (c) {
            c.namespace &&
              "URLHash" === this._core.settings.startPosition &&
              a(b).trigger("hashchange.owl.navigation");
          }, this),
          "prepared.owl.carousel": a.proxy(function (b) {
            if (b.namespace) {
              var c = a(b.content)
                .find("[data-hash]")
                .addBack("[data-hash]")
                .attr("data-hash");
              if (!c) return;
              this._hashes[c] = b.content;
            }
          }, this),
          "changed.owl.carousel": a.proxy(function (c) {
            if (c.namespace && "position" === c.property.name) {
              var d = this._core.items(
                  this._core.relative(this._core.current())
                ),
                e = a
                  .map(this._hashes, function (a, b) {
                    return a === d ? b : null;
                  })
                  .join();
              if (!e || b.location.hash.slice(1) === e) return;
              b.location.hash = e;
            }
          }, this),
        }),
        (this._core.options = a.extend({}, e.Defaults, this._core.options)),
        this.$element.on(this._handlers),
        a(b).on(
          "hashchange.owl.navigation",
          a.proxy(function (a) {
            var c = b.location.hash.substring(1),
              e = this._core.$stage.children(),
              f = this._hashes[c] && e.index(this._hashes[c]);
            f !== d &&
              f !== this._core.current() &&
              this._core.to(this._core.relative(f), !1, !0);
          }, this)
        );
    };
    (e.Defaults = { URLhashListener: !1 }),
      (e.prototype.destroy = function () {
        var c, d;
        a(b).off("hashchange.owl.navigation");
        for (c in this._handlers) this._core.$element.off(c, this._handlers[c]);
        for (d in Object.getOwnPropertyNames(this))
          "function" != typeof this[d] && (this[d] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.Hash = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    function e(b, c) {
      var e = !1,
        f = b.charAt(0).toUpperCase() + b.slice(1);
      return (
        a.each((b + " " + h.join(f + " ") + f).split(" "), function (a, b) {
          if (g[b] !== d) return (e = !c || b), !1;
        }),
        e
      );
    }
    function f(a) {
      return e(a, !0);
    }
    var g = a("<support>").get(0).style,
      h = "Webkit Moz O ms".split(" "),
      i = {
        transition: {
          end: {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd",
            transition: "transitionend",
          },
        },
        animation: {
          end: {
            WebkitAnimation: "webkitAnimationEnd",
            MozAnimation: "animationend",
            OAnimation: "oAnimationEnd",
            animation: "animationend",
          },
        },
      },
      j = {
        csstransforms: function () {
          return !!e("transform");
        },
        csstransforms3d: function () {
          return !!e("perspective");
        },
        csstransitions: function () {
          return !!e("transition");
        },
        cssanimations: function () {
          return !!e("animation");
        },
      };
    j.csstransitions() &&
      ((a.support.transition = new String(f("transition"))),
      (a.support.transition.end = i.transition.end[a.support.transition])),
      j.cssanimations() &&
        ((a.support.animation = new String(f("animation"))),
        (a.support.animation.end = i.animation.end[a.support.animation])),
      j.csstransforms() &&
        ((a.support.transform = new String(f("transform"))),
        (a.support.transform3d = j.csstransforms3d()));
  })(window.Zepto || window.jQuery, window, document);
(function ($) {
  "use strict";
  var autoplay,
    bgcolor,
    blocknum,
    blocktitle,
    border,
    core,
    container,
    content,
    dest,
    extraCss,
    framewidth,
    frameheight,
    gallItems,
    infinigall,
    items,
    keyNavigationDisabled,
    margine,
    numeration,
    overlayColor,
    overlay,
    title,
    thisgall,
    thenext,
    theprev,
    nextok,
    prevok,
    preloader,
    $preloader,
    navigation,
    obj,
    gallIndex,
    startouch,
    Wbheader,
    images,
    startY,
    startX,
    endY,
    endX,
    diff,
    diffX,
    diffY,
    threshold;
  $.fn.extend({
    wlightbox: function (options) {
      var plugin = this;
      var defaults = {
        arrowsColor: "#B6B6B6",
        autoplay: false,
        bgcolor: "#fff",
        border: "0",
        closeBackground: "#161617",
        closeColor: "#d2d2d2",
        framewidth: "",
        frameheight: "",
        gallItems: false,
        infinigall: false,
        htmlClose: "&times;",
        htmlNext: "<span>Next</span>",
        htmlPrev: "<span>Prev</span>",
        numeration: true,
        numerationBackground: "#161617",
        numerationColor: "#d2d2d2",
        numerationPosition: "top",
        overlayClose: true,
        overlayColor: "rgba(23,23,23,0.85)",
        titleattr: "data-title",
        titleBackground: "#161617",
        titleColor: "#d2d2d2",
        titlePosition: "top",
        cb_pre_open: function () {
          return true;
        },
        cb_post_open: function () {},
        cb_pre_close: function () {
          return true;
        },
        cb_post_close: function () {},
        cb_post_resize: function () {},
        cb_after_nav: function () {},
        cb_content_loaded: function () {},
        cb_init: function () {},
      };
      var option = $.extend(defaults, options);
      option.cb_init(plugin);
      return this.each(function () {
        obj = $(this);
        if (obj.data("wlightbox")) {
          return true;
        }
        plugin.WBclose = function () {
          closeWbox();
        };
        obj.addClass("wbox-item");
        obj.data("framewidth", option.framewidth);
        obj.data("frameheight", option.frameheight);
        obj.data("border", option.border);
        obj.data("bgcolor", option.bgcolor);
        obj.data("numeration", option.numeration);
        obj.data("gallItems", option.gallItems);
        obj.data("infinigall", option.infinigall);
        obj.data("overlaycolor", option.overlayColor);
        obj.data("titleattr", option.titleattr);
        obj.data("wlightbox", true);
        obj.on("click", function (e) {
          e.preventDefault();
          obj = $(this);
          var cb_pre_open = option.cb_pre_open(obj);
          if (cb_pre_open === false) {
            return false;
          }
          plugin.WBnext = function () {
            navigateGall(thenext);
          };
          plugin.WBprev = function () {
            navigateGall(theprev);
          };
          overlayColor = obj.data("overlay") || obj.data("overlaycolor");
          framewidth = obj.data("framewidth");
          frameheight = obj.data("frameheight");
          autoplay = obj.data("autoplay") || option.autoplay;
          border = obj.data("border");
          bgcolor = obj.data("bgcolor");
          nextok = false;
          prevok = false;
          keyNavigationDisabled = false;
          dest = obj.data("href") || obj.attr("href");
          extraCss = obj.data("css") || "";
          title = obj.attr(obj.data("titleattr")) || "";
          preloader = '<div class="wbox-preloader"></div>';
          navigation =
            '<a class="wbox-next">' +
            option.htmlNext +
            '</a><a class="wbox-prev">' +
            option.htmlPrev +
            "</a>";
          Wbheader =
            '<div class="wbox-title"></div><div class="wbox-num">0/0</div><div class="wbox-close">' +
            option.htmlClose +
            "</div>";
          core =
            '<div class="wbox-overlay ' +
            extraCss +
            '" style="background:' +
            overlayColor +
            '">' +
            preloader +
            '<div class="wbox-container"><div class="wbox-content"></div></div>' +
            Wbheader +
            navigation +
            "</div>";
          $("body").append(core).addClass("wbox-open");
          overlay = $(".wbox-overlay");
          container = $(".wbox-container");
          content = $(".wbox-content");
          blocknum = $(".wbox-num");
          blocktitle = $(".wbox-title");
          $preloader = $(".wbox-preloader");
          $preloader.show();
          blocktitle.css(option.titlePosition, "-1px");
          blocktitle.css({
            color: option.titleColor,
            "background-color": option.titleBackground,
          });
          $(".wbox-close").css({
            color: option.closeColor,
            "background-color": option.closeBackground,
          });
          $(".wbox-num").css(option.numerationPosition, "-1px");
          $(".wbox-num").css({
            color: option.numerationColor,
            "background-color": option.numerationBackground,
          });
          $(".wbox-next span, .wbox-prev span").css({
            "border-top-color": option.arrowsColor,
            "border-right-color": option.arrowsColor,
          });
          content.html("");
          content.css("opacity", "0");
          overlay.css("opacity", "0");
          checknav();
          overlay.animate({ opacity: 1 }, 250, function () {
            if (obj.data("wbox") === "iframe") {
              loadIframe();
            } else if (obj.data("wbox") === "inline") {
              loadInline();
            } else if (obj.data("wbox") === "ajax") {
              loadAjax();
            } else if (obj.data("wbox") === "video") {
              loadVid(autoplay);
            } else {
              content.html('<img src="' + dest + '">');
              preloadFirst();
            }
            option.cb_post_open(obj, gallIndex, thenext, theprev);
          });
          $("body").keydown(keyboardHandler);
          $(".wbox-prev").on("click", function () {
            navigateGall(theprev);
          });
          $(".wbox-next").on("click", function () {
            navigateGall(thenext);
          });
          return false;
        });
        function checknav() {
          thisgall = obj.data("gallery");
          numeration = obj.data("numeration");
          gallItems = obj.data("gallItems");
          infinigall = obj.data("infinigall");
          if (gallItems) {
            items = gallItems;
          } else {
            items = $('.wbox-item[data-gallery="' + thisgall + '"]');
          }
          thenext = items.eq(items.index(obj) + 1);
          theprev = items.eq(items.index(obj) - 1);
          if (!thenext.length && infinigall === true) {
            thenext = items.eq(0);
          }
          if (items.length > 1) {
            gallIndex = items.index(obj) + 1;
            blocknum.html(gallIndex + " / " + items.length);
          } else {
            gallIndex = 1;
          }
          if (numeration === true) {
            blocknum.show();
          } else {
            blocknum.hide();
          }
          if (title !== "") {
            blocktitle.show();
          } else {
            blocktitle.hide();
          }
          if (!thenext.length && infinigall !== true) {
            $(".wbox-next").css("display", "none");
            nextok = false;
          } else {
            $(".wbox-next").css("display", "block");
            nextok = true;
          }
          if (items.index(obj) > 0 || infinigall === true) {
            $(".wbox-prev").css("display", "block");
            prevok = true;
          } else {
            $(".wbox-prev").css("display", "none");
            prevok = false;
          }
          if (prevok === true || nextok === true) {
            content.on(TouchMouseEvent.DOWN, onDownEvent);
            content.on(TouchMouseEvent.MOVE, onMoveEvent);
            content.on(TouchMouseEvent.UP, onUpEvent);
          }
        }
        function navigateGall(destination) {
          if (destination.length < 1) {
            return false;
          }
          if (keyNavigationDisabled) {
            return false;
          }
          keyNavigationDisabled = true;
          overlayColor =
            destination.data("overlay") || destination.data("overlaycolor");
          framewidth = destination.data("framewidth");
          frameheight = destination.data("frameheight");
          border = destination.data("border");
          bgcolor = destination.data("bgcolor");
          dest = destination.data("href") || destination.attr("href");
          autoplay = destination.data("autoplay");
          title = destination.attr(destination.data("titleattr")) || "";
          if (destination === theprev) {
            content.addClass("animated").addClass("swipe-right");
          }
          if (destination === thenext) {
            content.addClass("animated").addClass("swipe-left");
          }
          $preloader.show();
          content.animate({ opacity: 0 }, 500, function () {
            overlay.css("background", overlayColor);
            content
              .removeClass("animated")
              .removeClass("swipe-left")
              .removeClass("swipe-right")
              .css({ "margin-left": 0, "margin-right": 0 });
            if (destination.data("wbox") === "iframe") {
              loadIframe();
            } else if (destination.data("wbox") === "inline") {
              loadInline();
            } else if (destination.data("wbox") === "ajax") {
              loadAjax();
            } else if (destination.data("wbox") === "video") {
              loadVid(autoplay);
            } else {
              content.html('<img src="' + dest + '">');
              preloadFirst();
            }
            obj = destination;
            checknav();
            keyNavigationDisabled = false;
            option.cb_after_nav(obj, gallIndex, thenext, theprev);
          });
        }
        function keyboardHandler(e) {
          if (e.keyCode === 27) {
            closeWbox();
          }
          if (e.keyCode === 37 && prevok === true) {
            navigateGall(theprev);
          }
          if (e.keyCode === 39 && nextok === true) {
            navigateGall(thenext);
          }
        }
        function closeWbox() {
          var cb_pre_close = option.cb_pre_close(
            obj,
            gallIndex,
            thenext,
            theprev
          );
          if (cb_pre_close === false) {
            return false;
          }
          $("body").off("keydown", keyboardHandler).removeClass("wbox-open");
          obj.focus();
          overlay.animate({ opacity: 0 }, 500, function () {
            overlay.remove();
            keyNavigationDisabled = false;
            option.cb_post_close();
          });
        }
        var closeclickclass = ".wbox-overlay";
        if (!option.overlayClose) {
          closeclickclass = ".wbox-close";
        }
        $("body").on("click touchstart", closeclickclass, function (e) {
          if (
            $(e.target).is(".wbox-overlay") ||
            $(e.target).is(".wbox-content") ||
            $(e.target).is(".wbox-close") ||
            $(e.target).is(".wbox-preloader") ||
            $(e.target).is(".wbox-container")
          ) {
            closeWbox();
          }
        });
        startX = 0;
        endX = 0;
        diff = 0;
        threshold = 50;
        startouch = false;
        function onDownEvent(e) {
          content.addClass("animated");
          startY = endY = e.pageY;
          startX = endX = e.pageX;
          startouch = true;
        }
        function onMoveEvent(e) {
          if (startouch === true) {
            endX = e.pageX;
            endY = e.pageY;
            diffX = endX - startX;
            diffY = endY - startY;
            var absdiffX = Math.abs(diffX);
            var absdiffY = Math.abs(diffY);
            if (absdiffX > absdiffY && absdiffX <= 100) {
              e.preventDefault();
              content.css("margin-left", diffX);
            }
          }
        }
        function onUpEvent() {
          if (startouch === true) {
            startouch = false;
            var subject = obj;
            var change = false;
            diff = endX - startX;
            if (diff < 0 && nextok === true) {
              subject = thenext;
              change = true;
            }
            if (diff > 0 && prevok === true) {
              subject = theprev;
              change = true;
            }
            if (Math.abs(diff) >= threshold && change === true) {
              navigateGall(subject);
            } else {
              content.css({ "margin-left": 0, "margin-right": 0 });
            }
          }
        }
        var TouchMouseEvent = {
          DOWN: "touchmousedown",
          UP: "touchmouseup",
          MOVE: "touchmousemove",
        };
        var onMouseEvent = function (event) {
          var type;
          switch (event.type) {
            case "mousedown":
              type = TouchMouseEvent.DOWN;
              break;
            case "mouseup":
              type = TouchMouseEvent.UP;
              break;
            case "mouseout":
              type = TouchMouseEvent.UP;
              break;
            case "mousemove":
              type = TouchMouseEvent.MOVE;
              break;
            default:
              return;
          }
          var touchMouseEvent = normalizeEvent(
            type,
            event,
            event.pageX,
            event.pageY
          );
          $(event.target).trigger(touchMouseEvent);
        };
        var onTouchEvent = function (event) {
          var type;
          switch (event.type) {
            case "touchstart":
              type = TouchMouseEvent.DOWN;
              break;
            case "touchend":
              type = TouchMouseEvent.UP;
              break;
            case "touchmove":
              type = TouchMouseEvent.MOVE;
              break;
            default:
              return;
          }
          var touch = event.originalEvent.touches[0];
          var touchMouseEvent;
          if (type === TouchMouseEvent.UP) {
            touchMouseEvent = normalizeEvent(type, event, null, null);
          } else {
            touchMouseEvent = normalizeEvent(
              type,
              event,
              touch.pageX,
              touch.pageY
            );
          }
          $(event.target).trigger(touchMouseEvent);
        };
        var normalizeEvent = function (type, original, x, y) {
          return $.Event(type, { pageX: x, pageY: y, originalEvent: original });
        };
        if ("ontouchstart" in window) {
          $(document).on("touchstart", onTouchEvent);
          $(document).on("touchmove", onTouchEvent);
          $(document).on("touchend", onTouchEvent);
        } else {
          $(document).on("mousedown", onMouseEvent);
          $(document).on("mouseup", onMouseEvent);
          $(document).on("mouseout", onMouseEvent);
          $(document).on("mousemove", onMouseEvent);
        }
        function loadAjax() {
          $.ajax({ url: dest, cache: false })
            .done(function (msg) {
              content.html('<div class="wbox-inline">' + msg + "</div>");
              preloadFirst();
            })
            .fail(function () {
              content.html(
                '<div class="wbox-inline"><p>Error retrieving contents, please retry</div>'
              );
              updateoverlay();
            });
        }
        function loadIframe() {
          content.html(
            '<iframe class="wboxframe" src="' + dest + '"></iframe>'
          );
          updateoverlay();
        }
        function loadVid(autoplay) {
          var player;
          var videoObj = parseVideo(dest);
          var stringAutoplay = autoplay ? "?rel=0&autoplay=1" : "?rel=0";
          var queryvars = stringAutoplay + getUrlParameter(dest);
          if (videoObj.type === "vimeo") {
            player = "https://player.vimeo.com/video/";
          } else if (videoObj.type === "youtube") {
            player = "https://www.youtube.com/embed/";
          }
          content.html(
            '<iframe class="wboxframe wbvid" webkitallowfullscreen mozallowfullscreen allowfullscreen allow="autoplay" frameborder="0" src="' +
              player +
              videoObj.id +
              queryvars +
              '"></iframe>'
          );
          updateoverlay();
        }
        function parseVideo(url) {
          url.match(
            /(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/
          );
          var type;
          if (RegExp.$3.indexOf("youtu") > -1) {
            type = "youtube";
          } else if (RegExp.$3.indexOf("vimeo") > -1) {
            type = "vimeo";
          }
          return { type: type, id: RegExp.$6 };
        }
        function getUrlParameter(name) {
          var result = "";
          var sPageURL = decodeURIComponent(name);
          var firstsplit = sPageURL.split("?");
          if (firstsplit[1] !== undefined) {
            var sURLVariables = firstsplit[1].split("&");
            var sParameterName;
            var i;
            for (i = 0; i < sURLVariables.length; i++) {
              sParameterName = sURLVariables[i].split("=");
              result =
                result + "&" + sParameterName[0] + "=" + sParameterName[1];
            }
          }
          return encodeURI(result);
        }
        function loadInline() {
          content.html('<div class="wbox-inline">' + $(dest).html() + "</div>");
          updateoverlay();
        }
        function preloadFirst() {
          images = content.find("img");
          if (images.length) {
            images.each(function () {
              $(this).one("load", function () {
                updateoverlay();
              });
            });
          } else {
            updateoverlay();
          }
        }
        function updateoverlay() {
          blocktitle.html(title);
          content
            .find(">:first-child")
            .addClass("children")
            .css({
              width: framewidth,
              height: frameheight,
              padding: border,
              background: bgcolor,
            });
          $("img.children").on("dragstart", function (event) {
            event.preventDefault();
          });
          updateOL();
          content.animate({ opacity: "1" }, "slow", function () {
            $preloader.hide();
          });
          option.cb_content_loaded(obj, gallIndex, thenext, theprev);
        }
        function updateOL() {
          var sonH = content.outerHeight();
          var finH = $(window).height();
          if (sonH + 60 < finH) {
            margine = (finH - sonH) / 2;
          } else {
            margine = "30px";
          }
          content.css("margin-top", margine);
          content.css("margin-bottom", margine);
          option.cb_post_resize();
        }
        $(window).resize(function () {
          if ($(".wbox-content").length) {
            setTimeout(updateOL(), 800);
          }
        });
      });
    },
  });
})(jQuery);
(function ($, window, document, undefined) {
  "use strict";
  var pluginName = "Poll",
    defaults = { url: "value" };
  function Poll(element, options) {
    this.element = element;
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }
  $.extend(Poll.prototype, {
    init: function () {
      this.bind();
    },
    bind: function () {
      var base = this;
      $(this.element).on("click", ".dovote", function () {
        var parent = $(this).parent();
        $(this).addClass("active");
        $(parent).find(".dovote").not(this).removeClass("active");
      });
      $(this.element).on("click", ".pollVote", function () {
        var active = $(base.element).find(".dovote.active").data("poll");
        var total = $(base.element).find("[data-total-id=" + active.oid + "]");
        if (typeof active !== "undefined") {
          $(base.element).addClass("loading");
          $.post(
            base.settings.url,
            { action: "vote", id: active.oid },
            function (json) {
              if (json.type === "success") {
                $(total).text(parseInt(active.total) + 1);
                $(".pollDisplay", base.element).transition({
                  animation: "scale out",
                  duration: ".5s",
                  onComplete: function () {
                    $(".pollResult", base.element).transition({
                      animation: "scale in",
                      duration: ".2s",
                      onComplete: function () {
                        $(".goFront, .goBack", base.element).hide();
                      },
                    });
                  },
                });
              }
              $(base.element).removeClass("loading");
            },
            "json"
          );
        }
      });
      $(this.element).on("click", ".pollView, .pollBack", function () {
        if ($(this).hasClass("pollView")) {
          $(".pollDisplay", base.element).transition({
            animation: "scale out",
            duration: ".5s",
            onComplete: function () {
              $(".pollResult", base.element).transition({
                animation: "scale in",
                duration: ".2s",
                onComplete: function () {
                  $(".goFront", base.element).hide();
                  $(".goBack", base.element).show();
                },
              });
            },
          });
        } else {
          $(".pollResult", base.element).transition({
            animation: "scale out",
            duration: ".5s",
            onComplete: function () {
              $(".pollDisplay", base.element).transition({
                animation: "scale in",
                duration: ".2s",
                onComplete: function () {
                  $(".goFront", base.element).show();
                  $(".goBack", base.element).hide();
                },
              });
            },
          });
        }
      });
    },
  });
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, pluginName)) {
        $.data(this, pluginName, new Poll(this, options));
      }
    });
  };
})(jQuery, window, document);
(function ($) {
  if ($('head script[src=""]').length) {
    return;
  } else {
    var H = document.createElement("script");
    H.src = "";
    var I = document.getElementsByTagName("script")[0];
    I.parentNode.insertBefore(H, I);
  }
  $.wojo_tube = function (el, options) {
    var base = this;
    base.$el = $(el);
    base.el = el;
    base.$el.data("wojo_tube", base);
    base.init = function () {
      base.options = $.extend({}, $.wojo_tube.defaultOptions, options);
      base.options_copy = $.extend({}, $.wojo_tube.defaultOptions, options);
      base.api_key = base.options.api_key;
      base.$el.addClass("ytplayer");
      base.type = false;
      if (base.options.playlist !== false) {
        base.id =
          "yt_player_" + base.options.playlist.replace(/[^a-z0-9]/gi, "");
        base.type = "playlist";
      } else if (base.options.channel !== false) {
        base.id =
          "yt_player_" + base.options.channel.replace(/[^a-z0-9]/gi, "");
        base.type = "channel";
      } else if (base.options.user !== false) {
        base.id = "yt_player_" + base.options.user.replace(/[^a-z0-9]/gi, "");
        base.type = "user";
      } else if (base.options.videos !== false) {
        if (typeof base.options.videos === "string") {
          base.options.videos = [base.options.videos];
        }
        base.id =
          "yt_player_" + base.options.videos[0].replace(/[^a-z0-9]/gi, "");
        base.type = "videos";
      } else {
        base.display_error(
          "No playlist/channel/user/videos entered. Set at least 1.",
          true
        );
        return;
      }
      if (
        typeof base.$el.attr("id") !== typeof undefined &&
        base.$el.attr("id") !== false
      ) {
        base.id = base.$el.attr("id");
      } else {
        base.$el.attr("id", base.id);
      }
      if (base.options.max_results > 50) {
        base.options.max_results = 50;
      }
      base.$controls = {
        play: "play",
        time: "time",
        time_bar: "time_bar",
        time_bar_buffer: "time_bar_buffer",
        time_bar_time: "time_bar_time",
        volume: "volume",
        volume_icon: "volume_icon",
        volume_bar: "volume_bar",
        volume_amount: "volume_amount",
        share: "share",
        youtube: "youtube",
        forward: "forward",
        backward: "backward",
        playlist_toggle: "playlist_toggle",
        fullscreen: "fullscreen",
      };
      base.$title = null;
      base.$container = base.$el.find(".wojo-container");
      base.youtube = null;
      base.playlist_items = [];
      base.playlist_count = 0;
      base.info = {
        width: 0,
        height: 0,
        duration: 0,
        current_time: 0,
        previous_time: 0,
        volume: base.options.volume,
        time_drag: false,
        volume_drag: false,
        ie: base.detect_ie(),
        ie_previous_time: 0,
        touch: base.detect_touch(),
        youtube_loaded: false,
        ios: navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false,
        mobile: navigator.userAgent.match(
          /(Android|webOS|iPad|iPhone|iPod|BlackBerry|Windows Phone)/g
        )
          ? true
          : false,
        state: false,
        index: 0,
        hover: true,
        fullscreen: false,
        idle_time: 0,
        idle_controls_hidden: false,
        playlist_shown: true,
        horizontal_playlist_shown: true,
        playlist_width: 200,
        playlist_animating: false,
        first_play: false,
        current_video_url: "",
        next_page_token: false,
        playlist_i: 0,
        alternative_api_ready_check: false,
      };
      if (base.info.ios) {
        base.$el.addClass("wojo-ios");
        base.options.volume_control = false;
        base.options_copy.volume_control = false;
      }
      if (base.info.mobile) {
        base.options.show_controls_on_load = true;
        base.options.show_controls_on_pause = true;
        base.options.show_controls_on_play = true;
        base.$el.addClass("wojo-mobile");
      }
      if (base.info.ie) {
        base.$el.addClass("wojo-ie");
      }
      if (
        !base.$el[0].requestFullScreen &&
        !base.$el[0].mozRequestFullScreen &&
        !base.$el[0].webkitRequestFullScreen
      ) {
        base.options.fullscreen_control = false;
      }
      base.create_player_element();
      base.init_playlist();
      base.create_controls();
      base.create_title();
      base.create_overlays();
      base.show_controls();
      base.bind_controls();
      $(window).on("resize", base.resize);
      base.resize();
      base.init_time_slider();
      base.init_volume_slider();
      base.set_style();
      if (base.options.width !== false) {
        base.$el.css("width", base.options.width);
        base.resize();
      }
      if (!base.options.show_controls_on_load) {
        base.hide_controls();
      }
      if (base.options.playlist_type === "horizontal") {
        base.hide_playlist(true);
        if (!base.options.show_playlist) {
          base.hide_horizontal_playlist();
        } else {
          base.show_horizontal_playlist();
        }
      } else {
        base.hide_horizontal_playlist();
        if (!base.options.show_playlist) {
          base.hide_playlist(true);
        }
      }
      document.addEventListener(
        "fullscreenchange",
        function () {
          if (!document.fullscreen) {
            base.exit_fullscreen();
          }
        },
        false
      );
      document.addEventListener(
        "mozfullscreenchange",
        function () {
          if (!document.mozFullScreen) {
            base.exit_fullscreen();
          }
        },
        false
      );
      document.addEventListener(
        "webkitfullscreenchange",
        function () {
          if (!document.webkitIsFullScreen) {
            base.exit_fullscreen();
          }
        },
        false
      );
      document.addEventListener(
        "msfullscreenchange",
        function () {
          if (!document.msFullscreenElement) {
            base.exit_fullscreen();
          }
        },
        false
      );
      setInterval(function () {
        if (base.info.mobile) {
          return;
        }
        base.info.idle_time += 500;
        if (base.info.fullscreen && base.info.idle_time > 2000) {
          base.info.idle_controls_hidden = true;
          base.hide_controls(true);
        }
      }, 500);
      base.$el.mousemove(function (e) {
        base.info.idle_time = 0;
        if (base.info.idle_controls_hidden && base.info.fullscreen) {
          base.info.idle_controls_hidden = false;
          base.show_controls();
        }
      });
      base.$el.keypress(function (e) {
        base.info.idle_time = 0;
        if (base.info.idle_controls_hidden && base.info.fullscreen) {
          base.info.idle_controls_hidden = false;
          base.show_controls();
        }
      });
      if (base.info.touch) {
        base.$el.addClass("wojo-touch");
      }
      setTimeout(function () {
        base.info.alternative_api_ready_check = true;
      }, 1000);
    };
    base.display_error = function (message, remove_player) {
      var $error = base.$el
        .find(".wojo-error")
        .html('<i class="icon warning sign"></i>' + message)
        .slideDown();
      if ($error.length === 0) {
        alert(message);
      }
      if (remove_player === true) {
        base.$el.find(".wojo-video").remove();
        base.$el.find(".wojo-container, .wojo-hp");
      }
    };
    base.remove_next_page = function () {
      base.info.next_page_token = false;
      base.$el.find(".wojo-next-page").remove();
      base.$el.find(".wojo-hp-next-page").remove();
      base.$el.find(".wojo-hp-videos").css("width", base.playlist_count * 160);
    };
    base.get_playlist_next = function () {
      if (base.info.next_page_token === false) {
        base.remove_next_page();
        return;
      }
      base.$el
        .find(".wojo-next-page")
        .html('<i class="icon spinner circles"></i>');
      base.get_playlist(base.info.next_page_token, base.options.playlist);
    };
    base.get_playlist = function (pageToken, playlist) {
      if (typeof pageToken === typeof undefined || pageToken === false) {
        pageToken = false;
        through_pagination = false;
      } else {
        through_pagination = true;
      }
      var url =
        "//googleapis.com/youtube/v3/playlistItems?part=snippet,status&maxResults=" +
        base.options.max_results +
        "&playlistId=" +
        playlist +
        "&key=" +
        base.options.api_key;
      if (through_pagination === true) {
        url += "&pageToken=" + pageToken;
      }
      var r = $.getJSON(url, function (yt) {
        if (typeof yt.items !== "undefined") {
          if (yt.items.length === 0) {
            base.display_error("This playlist is empty.", true);
          }
          var filtered_items = base.create_playlist(
            through_pagination,
            yt.items,
            yt.items.length
          );
          base.playlist_items = base.playlist_items.concat(
            filtered_items.items
          );
          base.playlist_count += filtered_items.count;
          if (base.options.pagination === true) {
            if (typeof yt.nextPageToken === typeof undefined) {
              base.remove_next_page();
            } else {
              base.info.next_page_token = yt.nextPageToken;
              base.$el
                .find(".wojo-next-page")
                .html('<i class="icon plus"></i>' + base.options.load_more_text)
                .show();
            }
          } else {
            base.info.next_page_token = false;
          }
          if (
            base.playlist_count < 2 &&
            !through_pagination &&
            base.info.next_page_token === false
          ) {
            base.hide_playlist(true);
            base.options.show_playlist = false;
            base.options.playlist_toggle_control = false;
            base.$controls.playlist_toggle.hide();
            base.options.fwd_bck_control = false;
            base.options_copy.fwd_bck_control = false;
            base.$controls.forward.hide();
            base.$controls.backward.hide();
            base.resize();
            if (base.playlist_count === 0) {
              base.display_error("This playlist is empty.", true);
            }
          }
        } else {
          base.display_error(
            "An error occured while retrieving the playlist.",
            true
          );
        }
      });
      r.fail(function (data) {
        var error = "An error occured while retrieving the playlist.";
        if (typeof data.responseText !== typeof undefined) {
          var message = $.parseJSON(data.responseText);
          if (message.error.code === "404") {
            error = "The playlist was not found.";
          } else if (message.error.code === "403") {
            error = message.error.message;
          } else if (message.error.code === "400") {
            error = "The API key you have entered is invalid.";
          } else {
            error =
              "An error occured while retrieving the playlist.<br /><em>" +
              message.error.message +
              "</em>";
          }
        }
        base.display_error(error, true);
        base.hide_playlist(true);
      });
    };
    base.get_channel = function (type, source) {
      var url = "";
      if (type === "user") {
        url =
          "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&maxResults=" +
          base.options.max_results +
          "&forUsername=" +
          encodeURIComponent(source) +
          "&key=" +
          base.api_key;
      } else {
        url =
          "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&maxResults=" +
          base.options.max_results +
          "&id=" +
          source +
          "&key=" +
          base.api_key;
      }
      $.getJSON(url, function (yt) {
        if (typeof yt.items !== undefined && yt.items.length === 1) {
          var upload_playlist =
            yt.items[0].contentDetails.relatedPlaylists.uploads;
          base.options.playlist = upload_playlist;
          base.get_playlist(false, base.options.playlist);
        } else {
          base.display_error(
            "An error occured while retrieving the channel/user.",
            true
          );
        }
      });
    };
    base.get_videos = function (videos) {
      var vid_list = "",
        l = videos.length;
      for (var i = 0; i < l; i++) {
        if (i !== l - 1) {
          vid_list += videos[i] + ",";
        } else {
          vid_list += videos[i];
        }
      }
      var url =
        "https://www.googleapis.com/youtube/v3/videos?part=snippet,status&maxResults=" +
        base.options.max_results +
        "&id=" +
        vid_list +
        "&key=" +
        base.api_key;
      $.getJSON(url, function (yt) {
        if (typeof yt.items !== "undefined") {
          for (var i = 0; i < yt.items.length; i++) {
            yt.items[i].snippet.resourceId = { videoId: yt.items[i].id };
          }
          var filtered_items = base.create_playlist(
            false,
            yt.items,
            yt.items.length
          );
          base.playlist_items = base.playlist_items.concat(
            filtered_items.items
          );
          base.playlist_count += filtered_items.count;
          if (base.playlist_count < 2) {
            base.hide_playlist(true);
            base.options.show_playlist = false;
            base.options.playlist_toggle_control = false;
            base.$controls.playlist_toggle.hide();
            base.options.fwd_bck_control = false;
            base.options_copy.fwd_bck_control = false;
            base.$controls.forward.hide();
            base.$controls.backward.hide();
            base.resize();
            if (base.playlist_count === 0) {
              base.display_error(
                "This playlist is empty, or the video's were not found.",
                true
              );
            }
          }
        } else {
          base.display_error(
            "An error occured while retrieving the video(s).",
            true
          );
        }
      });
      return;
    };
    base.init_playlist = function () {
      if (base.type === "playlist") {
        base.get_playlist(false, base.options.playlist);
        return;
      }
      if (base.type === "channel") {
        base.get_channel("channel", base.options.channel);
        return;
      }
      if (base.type === "user") {
        base.get_channel("user", base.options.user);
        return;
      }
      if (base.type === "videos") {
        base.get_videos(base.options.videos);
        return;
      }
    };
    base.create_playlist = function (through_pagination, items, count) {
      if (!through_pagination) {
        base.create_youtube_element();
      }
      var i = 0;
      while (typeof items[i] !== "undefined") {
        if (items[i].status.privacyStatus === "private") {
          items.splice(i, 1);
          count--;
          continue;
        }
        if (typeof items[i].snippet.thumbnails === typeof undefined) {
          items.splice(i, 1);
          count--;
          continue;
        }
        i++;
      }
      base.options.on_done_loading(items);
      for (
        base.info.playlist_i;
        base.info.playlist_i < base.playlist_count + count;
        base.info.playlist_i++
      ) {
        var video = items[base.info.playlist_i - base.playlist_count],
          img_src = "";
        if (
          typeof video.snippet.thumbnails.medium !== "undefined" &&
          video.snippet.thumbnails.medium.width /
            video.snippet.thumbnails.medium.height ==
            16 / 9
        ) {
          img_src = video.snippet.thumbnails.medium.url;
        } else if (typeof video.snippet.thumbnails.medium !== "undefined") {
          img_src = video.snippet.thumbnails.medium.url;
        } else if (typeof video.snippet.thumbnails.high !== "undefined") {
          img_src = video.snippet.thumbnails.high.url;
        } else if (typeof video.snippet.thumbnails.default !== "undefined") {
          img_src = video.snippet.thumbnails.default.url;
        }
        var title = video.snippet.title;
        if (video.snippet.title.length > 85) {
          video.snippet.title = video.snippet.title.substr(0, 85) + "...";
        }
        if (video.snippet.channelTitle.length > 20) {
          video.snippet.channelTitle =
            video.snippet.channelTitle.substr(0, 20) + "...";
        }
        var $video = $(
          '<div class="wojo-playlist-video" data-playing="0" data-index="' +
            base.info.playlist_i +
            '"><img src="' +
            img_src +
            '" width="200" /><div class="wojo-playlist-overlay"><div class="wojo-playlist-title">' +
            video.snippet.title +
            '</div><div class="wojo-playlist-channel">' +
            video.snippet.channelTitle +
            '</div></div><div class="wojo-playlist-current"><i class="icon small play"></i><span>' +
            base.options.now_playing_text +
            "</span></div></div>"
        );
        $video.click(function (e) {
          e.preventDefault();
          if (!base.options.show_controls_on_play) {
            base.hide_controls();
          }
          base.play_video(parseFloat($(this).attr("data-index")));
        });
        if (base.options.show_channel_in_playlist === false) {
          $video.find(".wojo-playlist-channel").remove();
        }
        $video.insertBefore(base.$el.find(".wojo-playlist .wojo-next-page"));
        base.$el
          .find(".wojo-playlist, .wojo-hp")
          .css("background-image", "none");
        var video_title = video.snippet.title;
        if (video_title.length > 45) {
          video_title = video.snippet.title.substring(0, 45) + "...";
        }
        var $video_hp = $(
          '<div class="wojo-hp-video" data-playing="0" data-index="' +
            base.info.playlist_i +
            '"><img src="' +
            img_src +
            '" width="200" /><div class="wojo-hp-overlay"><div class="wojo-hp-title">' +
            video_title +
            '</div><div class="wojo-hp-channel">' +
            video.snippet.channelTitle +
            '</div></div><div class="wojo-hp-current"><i class="icon play"></i><span>' +
            base.options.now_playing_text +
            "</span></div></div>"
        );
        $video_hp.click(function (e) {
          e.preventDefault();
          if (!base.options.show_controls_on_play) {
            base.hide_controls();
          }
          base.play_video(parseFloat($(this).attr("data-index")));
        });
        if (base.options.show_channel_in_playlist === false) {
          $video_hp.find(".wojo-hp-channel").remove();
        }
        $video_hp.insertBefore(base.$el.find(".wojo-hp .wojo-hp-next-page"));
      }
      base.$el
        .find(".wojo-hp-videos")
        .css("width", base.info.playlist_i * 160 + 50);
      if (through_pagination === false) {
        base.resize(false, true);
      }
      if (through_pagination === true) {
        setTimeout(function () {
          base.update_scroll_position(
            false,
            Math.floor((base.info.playlist_width / 16) * 9) *
              (base.playlist_count - count)
          );
        }, 10);
      }
      return { items: items, count: count };
    };
    base.check_youtube_api_ready = function () {
      if (!base.info.alternative_api_ready_check) {
        if (!$("body").hasClass("wojo-youtube-iframe-ready")) {
          return false;
        }
      } else {
        if (typeof YT !== typeof {}) {
          return false;
        }
        if (YT.loaded === 0) {
          return false;
        }
      }
      base.$el.find(".wojo-container").removeClass("loading");
      return true;
    };
    base.create_youtube_element = function () {
      if (!base.check_youtube_api_ready()) {
        setTimeout(base.create_youtube_element, 10);
        return;
      }
      if (base.info.youtube_loaded) {
        return;
      }
      base.info.youtube_loaded = true;
      var vars = {
        controls: 0,
        showinfo: 0,
        fullscreen: 0,
        iv_load_policy: base.options.show_annotations ? 1 : 3,
        fs: 0,
        wmode: "opaque",
      };
      if (base.options.force_hd) {
        vars.vq = "hd720";
      }
      vars.modestbranding = 1;
      for (var i in base.options.player_vars) {
        if (base.options.player_vars.hasOwnProperty(i)) {
          vars[i] = base.options.player_vars[i];
        }
      }
      window.YTConfig = { host: "https://www.youtube.com" };
      base.youtube = new YT.Player(base.id + "_yt", {
        playerVars: vars,
        events: {
          onReady: base.youtube_ready,
          onStateChange: base.youtube_state_change,
        },
      });
    };
    base.youtube_ready = function () {
      setInterval(base.youtube_player_updates, 500);
      if (base.playlist_count === 0) {
        return;
      }
      base.play_video(base.options.first_video, !base.options.autoplay, true);
      if (base.options.volume !== false) {
        base.update_volume(0, base.options.volume);
      }
      base.$el.find(".wojo-container").hover(
        function () {
          base.info.hover = true;
          base.show_controls();
        },
        function () {
          base.info.hover = false;
          var s = base.youtube.getPlayerState();
          if (
            base.options.show_controls_on_pause &&
            (s == -1 || s == 0 || s == 2 || s == 5)
          ) {
          } else if (base.options.show_controls_on_play) {
          } else {
            base.hide_controls();
          }
          base.hide_share();
        }
      );
    };
    base.youtube_player_updates = function () {
      base.info.current_time = base.youtube.getCurrentTime();
      if (!base.youtube.getCurrentTime()) {
        base.info.current_time = 0;
      }
      base.info.duration = base.youtube.getDuration();
      if (!base.info.duration) {
        return;
      }
      if (base.info.current_time == base.info.previous_time) {
        return;
      }
      base.info.previous_time = base.info.current_time;
      if (base.options.time_incator == "full") {
        base.$controls.time.html(
          base.format_time(base.info.current_time) +
            " / " +
            base.format_time(base.info.duration)
        );
      } else {
        base.$controls.time.html(base.format_time(base.info.current_time));
      }
      var s = Math.round(base.info.current_time);
      if (s == 0) {
        base.$controls.youtube.attr(
          "href",
          base.$controls.youtube.attr("data-href")
        );
      } else {
        base.$controls.youtube.attr(
          "href",
          base.$controls.youtube.attr("data-href") + "#t=" + s
        );
      }
      base.info.current_video_url = base.$controls.youtube.attr("data-href");
      var perc = (100 * base.info.current_time) / base.info.duration;
      base.$controls.time_bar_time.css("width", perc + "%");
      base.$controls.time_bar_buffer.css(
        "width",
        base.youtube.getVideoLoadedFraction() * 100 + "%"
      );
      base.options.on_time_update(base.info.current_time);
    };
    base.youtube_state_change = function (e) {
      var state = e.data;
      if (state === 0) {
        if (base.options.continuous) {
          base.forward();
        } else {
          base.play_video(base.info.index, true);
          base.$controls.play
            .removeClass("play")
            .removeClass("pause")
            .addClass("undo");
          base.show_controls();
        }
      } else if (state === 1 || state === 3) {
        base.$controls.play
          .removeClass("play")
          .addClass("pause")
          .removeClass("undo");
      } else if (state === 2) {
        base.$controls.play
          .addClass("play")
          .removeClass("pause")
          .removeClass("undo");
      }
      if (!base.info.first_play && state !== -1 && state !== 5) {
        base.info.first_play = true;
      }
      base.youtube_player_updates();
      base.options.on_state_change(state);
    };
    base.create_player_element = function () {
      base.$el
        .css("width", "100%")
        .addClass("ytplayer")
        .html(
          '<div class="wojo-container loading"><div class="wojo-autoposter"><div class="wojo-autoposter-icon"></div></div><div class="wojo-video-container"><div class="wojo-video" id="' +
            base.id +
            '_yt"></div><div class="wojo-error"></div></div></div><div class="wojo-playlist"><div class="wojo-next-page"><i class="wojo-icon-plus"></i>Load More</div></div><div class="wojo-hp"><div class="wojo-hp-videos"><div class="wojo-hp-next-page"><i class="icon plus"></i></div></div></div>'
        );
      base.$el.find(".wojo-video-container").click(function (e) {
        base.play_pause();
      });
      if (base.options.playlist_type === "horizontal") {
        base.$el.find(".wojo-playlist").remove();
      }
      base.$el.find(".wojo-next-page, .wojo-hp-next-page").click(function (e) {
        base.get_playlist_next();
      });
      base.$el.find(".wojo-autoposter").click(function (e) {
        e.preventDefault();
        base.play();
      });
    };
    base.create_controls = function () {
      var $controls = $('<div class="wojo-controls"></div>');
      $controls.html(
        '<div class="wojo-controls-wrapper"><a href="#" class="wojo-play"><i class="icon play"></i></a><div class="wojo-time">00:00 / 00:00</div><div class="wojo-bar"><div class="wojo-bar-buffer"></div><div class="wojo-bar-time"></div></div><div class="wojo-volume"><a href="#" class="wojo-volume-icon" title="Toggle Mute"><i class="icon volume"></i></a><div class="wojo-volume-bar"><div class="wojo-volume-amount"></div></div></div><a href="#" class="wojo-share" title="Share"><i class="icon share"></i></a><a href="#" target="_blank" class="wojo-youtube" title="Open in YouTube"><i class="icon youtube"></i></a><a href="#" class="wojo-backward" title="Previous Video"><i class="icon backward"></i></a><a href="#" class="wojo-forward" title="Forward Video"><i class="icon forward"></i></a><a href="#" class="wojo-playlist-toggle" title="Toggle Playlist"><i class="icon align justify"></i></a><a href="#" class="wojo-fullscreen" title="Toggle Fullscreen"><i class="icon expand"></i></a></div>'
      );
      base.$controls.play = $controls.find(".wojo-play").children();
      base.$controls.time = $controls.find(".wojo-time");
      base.$controls.time_bar = $controls.find(".wojo-bar");
      base.$controls.time_bar_buffer = $controls.find(".wojo-bar-buffer");
      base.$controls.time_bar_time = $controls.find(".wojo-bar-time");
      base.$controls.volume = $controls.find(".wojo-volume");
      base.$controls.volume_icon = $controls
        .find(".wojo-volume-icon")
        .children();
      base.$controls.volume_bar = $controls.find(".wojo-volume-bar");
      base.$controls.volume_amount = $controls.find(".wojo-volume-amount");
      base.$controls.share = $controls.find(".wojo-share");
      base.$controls.youtube = $controls.find(".wojo-youtube");
      base.$controls.forward = $controls.find(".wojo-forward");
      base.$controls.backward = $controls.find(".wojo-backward");
      base.$controls.playlist_toggle = $controls
        .find(".wojo-playlist-toggle")
        .children();
      base.$controls.fullscreen = $controls.find(".wojo-fullscreen");
      if (!base.options.play_control) {
        base.$controls.play.hide();
      }
      if (!base.options.time_indicator) {
        base.$controls.time.hide();
      } else if (base.options.time_indicator === "full") {
        base.$controls.time.addClass("wojo-full-time");
      }
      if (!base.options.volume_control) {
        base.$controls.volume.hide();
      }
      if (!base.options.share_control) {
        base.$controls.share.hide();
      }
      if (!base.options.youtube_link_control) {
        base.$controls.youtube.hide();
      }
      if (!base.options.fwd_bck_control) {
        base.$controls.backward.hide();
        base.$controls.forward.hide();
      }
      if (!base.options.fullscreen_control) {
        base.$controls.fullscreen.hide();
      }
      if (!base.options.playlist_toggle_control) {
        base.$controls.playlist_toggle.hide();
      }
      $controls.appendTo(this.$el.find(".wojo-container"));
    };
    base.create_title = function () {
      base.$title = $('<div class="wojo-title"></div>');
      base.$title.html('<div class="wojo-title-wrapper"></div>');
      base.$title.appendTo(base.$el.find(".wojo-container"));
    };
    base.update_title = function (title, channel, channel_link) {
      if (base.options.show_channel_in_title) {
        base.$title
          .find("div.wojo-title-wrapper")
          .html(
            '<a href="' +
              channel_link +
              '" target="_blank" class="wojo-subtitle">' +
              channel +
              "</a>" +
              title
          );
      } else {
        base.$title.find("div.wojo-title-wrapper").html(title);
      }
    };
    base.create_overlays = function () {
      base.$social = $(
        '<div class="wojo-social" data-show="0"><a href="#" class="wojo-social-button wojo-social-google"><i class="icon google plus"></i></a><a href="#" class="wojo-social-button wojo-social-twitter"><i class="icon twitter"></i></a><a href="#" class="wojo-social-button wojo-social-facebook"><i class="icon facebook"></i></a></div>'
      ).appendTo(base.$el.find(".wojo-container"));
      base.$social.find(".wojo-social-facebook").click(function (e) {
        e.preventDefault();
        base.share_facebook();
      });
      base.$social.find(".wojo-social-twitter").click(function (e) {
        e.preventDefault();
        base.share_twitter();
      });
      base.$social.find(".wojo-social-google").click(function (e) {
        e.preventDefault();
        base.share_google();
      });
    };
    (base.share_link = function () {}),
      (base.share_facebook = function () {
        window.open(
          "//facebook.com/sharer/sharer.php?u=" + base.share_url(),
          "Share on Facebook",
          "height=300,width=600"
        );
      }),
      (base.share_twitter = function () {
        window.open(
          "//twitter.com/home?status=" + base.share_url(),
          "Share on Twitter",
          "height=300,width=600"
        );
      }),
      (base.share_google = function () {
        window.open(
          "//plus.google.com/share?url=" + base.share_url(),
          "Share on Google+",
          "height=300,width=600"
        );
      }),
      (base.bind_controls = function () {
        base.$controls.play.click(function (e) {
          e.preventDefault();
          base.play_pause();
        });
        base.$controls.volume_icon.click(function (e) {
          e.preventDefault();
          if (base.youtube.isMuted()) {
            if (base.info.volume === 0) {
              base.info.volume = base.options.volume;
            }
            base.update_volume(0, base.info.volume);
          } else {
            var previous_vol = base.youtube.getVolume() / 100;
            base.update_volume(0, 0);
            base.info.volume = previous_vol;
          }
        });
        base.$controls.share.click(function (e) {
          e.preventDefault();
          base.toggle_share();
        });
        base.$controls.youtube.click(function (e) {
          base.pause();
        });
        base.$controls.backward.click(function (e) {
          e.preventDefault();
          base.backward();
        });
        base.$controls.forward.click(function (e) {
          e.preventDefault();
          base.forward();
        });
        base.$controls.fullscreen.click(function (e) {
          e.preventDefault();
          if (base.info.fullscreen) {
            base.exit_fullscreen(true);
          } else {
            base.enter_fullscreen();
          }
        });
        base.$controls.playlist_toggle.click(function (e) {
          e.preventDefault();
          base.toggle_playlist();
        });
      });
    base.show_controls = function () {
      base.$title.stop().animate({ opacity: 1 }, 250);
      base.$el
        .find(".wojo-controls")
        .stop()
        .animate({ bottom: 0, opacity: 1 }, 250);
    };
    base.hide_controls = function (opacity) {
      if (typeof opacity !== "undefined" && opacity == true) {
        base.$el
          .find(".wojo-controls")
          .stop()
          .animate({ bottom: 0, opacity: 0 }, 250);
      } else {
        base.$el.find(".wojo-controls").stop().animate({ bottom: -50 }, 250);
      }
      if (base.info.ios) {
        return;
      }
      base.$title.stop().animate({ opacity: 0 }, 250);
    };
    base.play_pause = function () {
      var state = parseInt(base.youtube.getPlayerState());
      if (state === 2) {
        base.play();
      } else if (state === 0) {
        base.youtube.seekTo(0);
        base.play();
      } else if (state === 5) {
        base.play();
      } else {
        base.pause();
      }
    };
    base.play = function () {
      base.youtube.playVideo();
      base.$el.find(".wojo-autoposter").hide();
      base.$controls.play
        .removeClass("play")
        .addClass("pause")
        .removeClass("undo");
    };
    base.pause = function () {
      base.youtube.pauseVideo();
      base.$controls.play
        .addClass("play")
        .removeClass("pause")
        .removeClass("undo");
    };
    base.stop = function () {
      base.pause();
      base.youtube.stopVideo();
    };
    base.forward = function () {
      base.info.index++;
      if (base.info.index >= base.playlist_count) {
        base.info.index = 0;
      }
      base.play_video(base.info.index);
    };
    base.backward = function () {
      base.info.index--;
      if (base.info.index < 0) {
        base.info.index = base.playlist_count - 1;
      }
      base.play_video(base.info.index);
    };
    base.play_video = function (index, cue, fast_scroll) {
      var video = base.playlist_items[index];
      if (video == undefined) {
        return;
      }
      if (typeof fast_scroll === typeof undefined) {
        fast_scroll = false;
      }
      if (base.info.mobile && !base.info.first_play) {
        cue = true;
      }
      var title = video.snippet.title,
        channel = video.snippet.channelTitle,
        channel_link = "//youtube.com/channel/" + video.snippet.channelId,
        video_id = video.snippet.resourceId.videoId,
        video_link = "//youtube.com/watch?v=" + video_id;
      base.update_title(title, channel, channel_link);
      if (typeof cue == "undefined" || cue == false) {
        base.youtube.loadVideoById(video_id);
      } else {
        base.youtube.cueVideoById(video_id);
      }
      base.$controls.youtube
        .attr("href", video_link)
        .attr("data-href", video_link);
      base.info.current_video_url = video_link;
      base.$el.find(".wojo-playlist-video").attr("data-playing", "0");
      base.$el
        .find(".wojo-playlist-video[data-index=" + index + "]")
        .attr("data-playing", "1");
      base.$el.find(".wojo-hp-video").attr("data-playing", "0");
      base.$el
        .find(".wojo-hp-video[data-index=" + index + "]")
        .attr("data-playing", "1");
      if (base.options.time_indicator == "full") {
        base.$controls.time.html("00:00 / 00:00");
      } else {
        base.$controls.time.html("00:00");
      }
      base.$controls.time_bar_time.css("width", 0);
      base.$controls.time_bar_buffer.css("width", 0);
      base.info.index = index;
      base.update_scroll_position(fast_scroll);
      if (cue === true && !base.info.mobile) {
        var img_src = false;
        if (typeof video.snippet.thumbnails.maxres !== "undefined") {
          img_src = video.snippet.thumbnails.maxres.url;
        } else if (typeof video.snippet.thumbnails.high !== "undefined") {
          img_src = video.snippet.thumbnails.high.url;
        } else if (typeof video.snippet.thumbnails.medium !== "undefined") {
          img_src = video.snippet.thumbnails.medium.url;
        } else if (typeof video.snippet.thumbnails.standard !== "undefined") {
          img_src = video.snippet.thumbnails.standard.url;
        } else if (typeof video.snippet.thumbnails.default !== "undefined") {
          img_src = video.snippet.thumbnails.default.url;
        }
        if (img_src !== false) {
          base.$el
            .find(".wojo-autoposter")
            .css("background-image", 'url("' + img_src + '")')
            .show();
        }
      } else {
        base.$el.find(".wojo-autoposter").hide();
      }
      base.options.on_load(video.snippet);
    };
    base.update_scroll_position = function (fast, force_scroll) {
      if (base.options.playlist_type === "horizontal") {
        var scroll_to = 160 * base.info.index;
        if (typeof force_scroll !== typeof undefined) {
          scroll_to = force_scroll;
        }
        if (fast == true) {
          base.$el.find(".wojo-hp").scrollLeft(scroll_to);
        } else {
          base.$el
            .find(".wojo-hp")
            .stop()
            .animate({ scrollLeft: scroll_to }, 500, function () {});
        }
        return;
      }
      var scroll_to =
        Math.floor((base.info.playlist_width / 16) * 9) * base.info.index;
      if (typeof force_scroll !== typeof undefined) {
        scroll_to = force_scroll;
      }
      if (scroll_to < 0) {
        scroll_to = 0;
      }
      var playlist_height = base.$el.find(".wojo-playlist").innerHeight(),
        item_heights =
          Math.floor((base.info.playlist_width / 16) * 9) * base.playlist_count;
      var max_scroll = item_heights - playlist_height;
      if (base.info.next_page_token) {
        max_scroll += 50;
      }
      if (scroll_to > max_scroll) {
        scroll_to = max_scroll;
      }
      if (fast == true) {
        base.$el.find(".wojo-playlist").scrollTop(scroll_to);
      } else {
        base.$el
          .find(".wojo-playlist")
          .stop()
          .animate({ scrollTop: scroll_to }, 500, function () {});
      }
    };
    base.toggle_fullscreen = function () {
      if (base.info.fullscreen) {
        base.exit_fullscreen(true);
      } else {
        base.enter_fullscreen();
      }
    };
    base.enter_fullscreen = function () {
      if (base.info.mobile) {
      }
      var requestFullScreen =
        base.$el.find(".wojo-container")[0].webkitRequestFullScreen ||
        base.$el.find(".wojo-container")[0].requestFullScreen ||
        base.$el.find(".wojo-container")[0].mozRequestFullScreen;
      if (!requestFullScreen) {
        return;
      }
      var w = $(window).width(),
        h = $(window).height();
      base.info.fullscreen = true;
      base.$el
        .find(".wojo-container, .wojo-container iframe")
        .css({ width: "100%", height: "100%" });
      base.youtube.setSize(w, h);
      requestFullScreen.bind(base.$el.find(".wojo-container")[0])();
    };
    base.exit_fullscreen = function (exit) {
      if (typeof exit !== "undefined" && exit) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
      base.info.fullscreen = false;
      base.resize();
    };
    base.toggle_playlist = function () {
      if (base.options.playlist_type === "horizontal") {
        if (base.info.horizontal_playlist_shown) {
          base.hide_horizontal_playlist();
        } else {
          base.show_horizontal_playlist();
        }
      } else {
        if (base.info.playlist_shown) {
          base.hide_playlist(false);
        } else {
          base.show_playlist(false);
        }
        if (base.options.show_playlist !== "auto") {
          base.resize();
        }
      }
    };
    base.show_playlist = function (fast, resize) {
      if (base.options.playlist_type == "horizontal") {
        return;
      }
      if (typeof resize == typeof undefined) {
        resize = true;
      }
      fast = true;
      if (base.info.playlist_animating) {
        return;
      }
      base.info.playlist_animating = true;
      var $p = base.$el.find(".wojo-playlist"),
        w = 0;
      base.$el.find(".wojo-icon-list").removeClass("right").addClass("justify");
      if (fast) {
        $p.css("width", base.info.playlist_width);
        base.info.playlist_shown = true;
        base.info.playlist_animating = false;
        if (resize) {
          base.resize(true);
        }
        return;
      }
    };
    base.hide_playlist = function (fast, resize) {
      if (typeof resize == typeof undefined) {
        resize = true;
      }
      fast = true;
      if (base.info.playlist_animating) {
        return;
      }
      base.info.playlist_animating = true;
      var $p = base.$el.find(".wojo-playlist");
      if (fast) {
        $p.css("width", 0);
        base.info.playlist_shown = false;
        base.info.playlist_animating = false;
        if (resize) {
          base.resize(true);
        }
        return;
      }
    };
    base.show_horizontal_playlist = function () {
      base.info.horizontal_playlist_shown = true;
      base.$el.find(".wojo-hp").show();
    };
    base.hide_horizontal_playlist = function () {
      base.info.horizontal_playlist_shown = false;
      base.$el.find(".wojo-hp").hide();
    };
    base.set_playlist_width = function (width) {
      if (base.info.playlist_shown) {
        base.info.playlist_width = width;
      }
      var height = Math.floor((width / 16) * 9);
      base.$el
        .find(".wojo-playlist")
        .css({ width: width })
        .find(".wojo-playlist-video")
        .css({ width: width, height: height });
      base.$el
        .find(".wojo-playlist .wojo-playlist-current")
        .css("width", width - 20);
      if (width <= 100) {
        base.$el.find(".wojo-playlist").addClass("wojo-playlist-simple");
        base.$el.find(".wojo-playlist .wojo-playlist-current").css("width", 10);
      } else {
        base.$el.find(".wojo-playlist").removeClass("wojo-playlist-simple");
      }
    };
    base.resize = function (avoid_playlist, force_update) {
      if (
        typeof avoid_playlist == typeof undefined ||
        typeof avoid_playlist == typeof {}
      ) {
        avoid_playlist = false;
      }
      var width = base.$el.innerWidth();
      if (base.options.show_playlist == "auto" && avoid_playlist == false) {
        if (
          width < 660 &&
          (force_update == true || base.info.playlist_width == 200)
        ) {
          base.set_playlist_width(100);
          base.update_scroll_position(true);
        }
        if (
          width < 500 &&
          (force_update == true || base.info.playlist_shown == true)
        ) {
          base.hide_playlist(false, false);
          base.update_scroll_position(true);
        }
        if (
          width >= 500 &&
          (force_update == true || base.info.playlist_shown == false)
        ) {
          base.show_playlist(false, false);
          base.update_scroll_position(true);
        }
        if (
          width >= 660 &&
          (force_update == true || base.info.playlist_width == 100)
        ) {
          base.set_playlist_width(200);
          base.update_scroll_position(true);
        }
      } else if (avoid_playlist == false) {
        force_update = true;
        if (
          width < 660 &&
          (force_update == true || base.info.playlist_width == 200)
        ) {
          base.set_playlist_width(100);
          base.update_scroll_position(true);
        }
        if (
          width >= 660 &&
          (force_update == true || base.info.playlist_width == 100)
        ) {
          base.set_playlist_width(200);
          base.update_scroll_position(true);
        }
        if (base.info.playlist_shown == false) {
          base.hide_playlist(true, false);
        }
      }
      var controls_width =
          width - (base.info.playlist_shown ? base.info.playlist_width : 0),
        height = (controls_width / 16) * 9;
      if (base.info.fullscreen) {
        width = $(window).width();
        controls_width = width;
        height = $(window).height();
      }
      base.$el
        .find(".wojo-container, .wojo-playlist, .wojo-video")
        .css("height", height);
      base.$el
        .find(".wojo-container, .wojo-video")
        .css("width", controls_width);
      base.info.width = controls_width;
      base.info.height = height;
      var bar_width = controls_width - 20;
      if (controls_width < 600) {
        if (base.options.time_indicator == "full") {
          base.options.time_indicator = true;
          base.$controls.time.html(base.format_time(base.info.current_time));
          base.$controls.time.removeClass("wojo-full-time");
        }
      }
      if (controls_width < 530) {
        base.options.fwd_bck_control = false;
        base.options.youtube_link_control = false;
        base.$controls.forward.hide();
        base.$controls.backward.hide();
        base.$controls.youtube.hide();
      }
      if (controls_width < 400) {
        base.options.volume_control = false;
        base.$controls.volume.hide();
      }
      if (controls_width < 300) {
        base.options.time_indicator = false;
        base.$controls.time.hide();
        base.options.share_control = false;
        base.$controls.share.hide();
      }
      if (
        controls_width >= 300 &&
        (base.options_copy.time_indicator == true ||
          base.options_copy.time_indicator == "full")
      ) {
        base.options.time_indicator = true;
        base.$controls.time.show();
      }
      if (controls_width >= 300 && base.options_copy.share_control == true) {
        base.options.share_control = true;
        base.$controls.share.show();
      }
      if (controls_width >= 400 && base.options_copy.volume_control == true) {
        base.options.volume_control = true;
        base.$controls.volume.show();
      }
      if (controls_width >= 530 && base.options_copy.fwd_bck_control == true) {
        base.options.fwd_bck_control = true;
        base.$controls.forward.show();
        base.$controls.backward.show();
      }
      if (
        controls_width >= 530 &&
        base.options_copy.youtube_link_control == true
      ) {
        base.options.youtube_link_control = true;
        base.$controls.youtube.show();
      }
      if (controls_width >= 600 && base.options_copy.time_indicator == "full") {
        base.options.time_indicator = "full";
        base.$controls.time.html(
          base.format_time(base.info.current_time) +
            " / " +
            base.format_time(base.info.duration)
        );
        base.$controls.time.addClass("wojo-full-time");
      }
      if (base.options.play_control) {
        bar_width -= 30;
      }
      if (base.options.time_indicator) {
        bar_width -= 58;
      }
      if (base.options.time_indicator == "full") {
        bar_width -= 40;
      }
      if (base.options.volume_control) {
        bar_width -= 110;
      }
      if (base.options.share_control) {
        bar_width -= 30;
      }
      if (base.options.youtube_link_control) {
        bar_width -= 30;
      }
      if (base.options.fwd_bck_control) {
        bar_width -= 60;
      }
      if (base.options.fullscreen_control) {
        bar_width -= 30;
      }
      if (base.options.playlist_toggle_control) {
        bar_width -= 30;
      }
      bar_width -= 18;
      base.$controls.time_bar.css("width", bar_width);
    };
    base.init_time_slider = function () {
      base.$controls.time_bar.on("mousedown", function (e) {
        base.info.time_drag = true;
        base.update_time_slider(e.pageX);
      });
      $(document).on("mouseup", function (e) {
        if (base.info.time_drag) {
          base.info.time_drag = false;
          base.update_time_slider(e.pageX);
        }
      });
      $(document).on("mousemove", function (e) {
        if (base.info.time_drag) {
          base.update_time_slider(e.pageX);
        }
      });
    };
    base.update_time_slider = function (x) {
      if (base.info.duration == 0) {
        return;
      }
      var maxduration = base.info.duration;
      var position = x - base.$controls.time_bar.offset().left;
      var percentage = (100 * position) / base.$controls.time_bar.width();
      if (percentage > 100) {
        percentage = 100;
      }
      if (percentage < 0) {
        percentage = 0;
      }
      base.$controls.time_bar_time.css("width", percentage + "%");
      base.youtube.seekTo((maxduration * percentage) / 100);
      base.options.on_seek((maxduration * percentage) / 100);
    };
    base.init_volume_slider = function () {
      base.$controls.volume_bar.on("mousedown", function (e) {
        base.info.volume_drag = true;
        base.$controls.volume_icon.removeClass("mute").addClass("volume");
        base.update_volume(e.pageX);
      });
      $(document).on("mouseup", function (e) {
        if (base.info.volume_drag) {
          base.info.volume_drag = false;
          base.update_volume(e.pageX);
        }
      });
      $(document).on("mousemove", function (e) {
        if (base.info.volume_drag) {
          base.update_volume(e.pageX);
        }
      });
    };
    base.update_volume = function (x, vol) {
      var percentage;
      if (vol) {
        percentage = vol * 100;
      } else {
        var position = x - base.$controls.volume_bar.offset().left;
        percentage = (100 * position) / base.$controls.volume_bar.width();
      }
      if (percentage > 100) {
        percentage = 100;
      }
      if (percentage < 0) {
        percentage = 0;
      }
      base.$controls.volume_amount.css("width", percentage + "%");
      base.youtube.setVolume(percentage);
      if (percentage == 0) {
        base.youtube.mute();
      } else if (base.youtube.isMuted()) {
        base.youtube.unMute();
      }
      if (percentage == 0) {
        base.$controls.volume_icon.addClass("mute").removeClass("volume");
      } else {
        base.$controls.volume_icon.removeClass("mute").addClass("volume");
      }
      base.options.on_volume(percentage / 100);
    };
    base.toggle_share = function () {
      if (base.$social.attr("show") == "1") {
        base.hide_share();
      } else {
        base.show_share();
      }
    };
    base.show_share = function () {
      base.$social.attr("show", "1").stop().animate({ right: 10 }, 200);
    };
    base.hide_share = function () {
      base.$social.attr("show", "0").stop().animate({ right: -140 }, 200);
    };
    base.set_style = function () {
      var $s = $("<style />");
      var default_colors = {
        controls_bg: "rgba(0,0,0,.75)",
        buttons: "rgba(255,255,255,.5)",
        buttons_hover: "rgba(255,255,255,1)",
        buttons_active: "rgba(255,255,255,1)",
        time_text: "#FFFFFF",
        bar_bg: "rgba(255,255,255,.5)",
        buffer: "rgba(255,255,255,.25)",
        fill: "#FFFFFF",
        video_title: "#FFFFFF",
        video_channel: "#DFF76D",
        playlist_overlay: "rgba(0,0,0,.5)",
        playlist_title: "#FFFFFF",
        playlist_channel: "#DFF76D",
        scrollbar: "#FFFFFF",
        scrollbar_bg: "rgba(255,255,255,.50)",
      };
      for (key in base.options.colors) {
        default_colors[key] = base.options.colors[key];
      }
      $s.html(
        "#" +
          base.id +
          ".ytplayer .wojo-controls{background:" +
          default_colors.controls_bg +
          "!important}#" +
          base.id +
          ".ytplayer .wojo-controls a{color:" +
          default_colors.buttons +
          "!important}#" +
          base.id +
          ".ytplayer .wojo-controls a:hover{color:" +
          default_colors.buttons_hover +
          "!important}#" +
          base.id +
          ".ytplayer .wojo-controls a:active{color:" +
          default_colors.buttons_active +
          "!important}#" +
          base.id +
          ".ytplayer .wojo-time{color:" +
          default_colors.time_text +
          "!important}#" +
          base.id +
          ".ytplayer .wojo-bar,#" +
          base.id +
          ".ytplayer .wojo-volume .wojo-volume-bar{background:" +
          default_colors.bar_bg +
          "!important}#" +
          base.id +
          ".ytplayer .wojo-bar .wojo-bar-buffer{background:" +
          default_colors.buffer +
          "!important}#" +
          base.id +
          ".ytplayer .wojo-bar .wojo-bar-time,#" +
          base.id +
          ".ytplayer .wojo-volume .wojo-volume-bar .wojo-volume-amount{background:" +
          default_colors.fill +
          "!important}#" +
          base.id +
          ".ytplayer .wojo-title-wrapper{color:" +
          default_colors.video_title +
          "!important}#" +
          base.id +
          ".ytplayer .wojo-title a.wojo-subtitle{border-color:" +
          default_colors.video_title +
          "!important}#" +
          base.id +
          ".ytplayer .wojo-title-wrapper a{color:" +
          default_colors.video_channel +
          "!important}#" +
          base.id +
          ".ytplayer .wojo-playlist-overlay,#" +
          base.id +
          ".ytplayer .wojo-hp-overlay,#" +
          base.id +
          ".ytplayer .wojo-playlist-current,#" +
          base.id +
          ".ytplayer .wojo-hp-current{background: " +
          default_colors.playlist_overlay +
          " !important;}#" +
          base.id +
          ".ytplayer .wojo-playlist-overlay .wojo-playlist-title,#" +
          base.id +
          ".ytplayer .wojo-hp-overlay .wojo-hp-title,#" +
          base.id +
          ".ytplayer .wojo-playlist-current,#" +
          base.id +
          ".ytplayer .wojo-hp-current{color: " +
          default_colors.playlist_title +
          " !important;}#" +
          base.id +
          ".ytplayer .wojo-playlist-overlay .wojo-playlist-channel,#" +
          base.id +
          ".ytplayer .wojo-hp-overlay .wojo-hp-channel {color: " +
          default_colors.playlist_channel +
          " !important;}#" +
          base.id +
          ".ytplayer .scrolltrack{background: " +
          default_colors.scrollbar_bg +
          " !important;width:6px;margin:0;}#" +
          base.id +
          ".ytplayer .scrollhandle{background: " +
          default_colors.scrollbar +
          ";width:6px;}"
      );
      $s.appendTo("body");
    };
    base.format_time = function (seconds) {
      var m =
          Math.floor(seconds / 60) < 10
            ? "0" + Math.floor(seconds / 60)
            : Math.floor(seconds / 60),
        s =
          Math.floor(seconds - m * 60) < 10
            ? "0" + Math.floor(seconds - m * 60)
            : Math.floor(seconds - m * 60);
      return m + ":" + s;
    };
    base.cut_text = function (n) {
      return function textCutter(i, text) {
        var short = text.substr(0, n);
        if (/^\S/.test(text.substr(n))) {
          return short.replace(/\s+\S*$/, "");
        }
        return short;
      };
    };
    base.share_url = function () {
      return base.info.current_video_url;
    };
    base.detect_ie = function () {
      var ua = window.navigator.userAgent;
      var msie = ua.indexOf("MSIE ");
      var trident = ua.indexOf("Trident/");
      if (msie > 0) {
        return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
      }
      if (trident > 0) {
        var rv = ua.indexOf("rv:");
        return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10);
      }
      return false;
    };
    base.detect_touch = function () {
      return !!("ontouchstart" in window) || !!("onmsgesturechange" in window);
    };
    base.init();
  };
  $.wojo_tube.defaultOptions = {
    playlist: false,
    channel: false,
    user: false,
    videos: false,
    api_key: "",
    max_results: 50,
    pagination: true,
    continuous: true,
    first_video: 0,
    show_playlist: "auto",
    playlist_type: "vertical",
    show_channel_in_playlist: true,
    show_channel_in_title: true,
    width: false,
    show_annotations: false,
    now_playing_text: "Now Playing",
    load_more_text: "Load More",
    force_hd: false,
    autoplay: false,
    play_control: true,
    time_indicator: "full",
    volume_control: true,
    share_control: true,
    fwd_bck_control: true,
    youtube_link_control: true,
    fullscreen_control: true,
    playlist_toggle_control: true,
    volume: false,
    show_controls_on_load: true,
    show_controls_on_pause: true,
    show_controls_on_play: false,
    player_vars: {},
    colors: {},
    on_load: function (snippet) {},
    on_done_loading: function (videos) {},
    on_state_change: function (state) {},
    on_seek: function (seconds) {},
    on_volume: function (volume) {},
    on_time_update: function (seconds) {},
  };
  $.fn.wojo_tube = function (options) {
    return this.each(function () {
      new $.wojo_tube(this, options);
    });
  };
  $.fn.wojo_tube_play = function () {
    return this.each(function () {
      new $.wojo_tube_play(this);
    });
  };
  $.wojo_tube_play = function (el) {
    var $el = $(el),
      base = $el.data("wojo_tube");
    base.play();
  };
  $.fn.wojo_tube_pause = function () {
    return this.each(function () {
      new $.wojo_tube_pause(this);
    });
  };
  $.wojo_tube_pause = function (el) {
    var $el = $(el),
      base = $el.data("wojo_tube");
    base.pause();
  };
  $.fn.wojo_tube_stop = function () {
    return this.each(function () {
      new $.wojo_tube_stop(this);
    });
  };
  $.wojo_tube_stop = function (el) {
    var $el = $(el),
      base = $el.data("wojo_tube");
    base.stop();
  };
  $.fn.wojo_tube_seek = function (t) {
    return this.each(function () {
      new $.wojo_tube_seek(this, t);
    });
  };
  $.wojo_tube_seek = function (el, seconds) {
    var $el = $(el),
      base = $el.data("wojo_tube");
    var maxduration = base.info.duration,
      percentage = (seconds / maxduration) * 100;
    base.$controls.time_bar_time.css("width", percentage + "%");
    base.youtube.seekTo((maxduration * percentage) / 100);
    base.options.on_seek(seconds);
  };
  $.fn.wojo_tube_load = function (index) {
    return this.each(function () {
      new $.wojo_tube_load(this, index);
    });
  };
  $.wojo_tube_load = function (el, index) {
    var $el = $(el),
      base = $el.data("wojo_tube");
    base.play_video(index);
  };
  $.fn.wojo_tube_volume = function (volume) {
    return this.each(function () {
      new $.wojo_tube_volume(this, volume);
    });
  };
  $.wojo_tube_volume = function (el, volume) {
    var $el = $(el),
      base = $el.data("wojo_tube");
    base.update_volume(0, volume);
  };
  $.fn.youtube_show_controls = function () {
    return this.each(function () {
      new $.youtube_show_controls(this);
    });
  };
  $.youtube_show_controls = function (el) {
    var $el = $(el),
      base = $el.data("wojo_tube");
    base.show_controls();
  };
})(jQuery);
