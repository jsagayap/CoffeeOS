var up = 0;
var hl = 0;
var files;
var games;
var links;
var user = "user";
var hist = [];
var iconDrag = false, cmActive = false, plsWait = false, firstLg = false;

var apps = ["calc", "ed", "emu", "files", "image", "intro", "paint", "playground", "run", "settings", "term", "vscode", "web"];
var proc = [];
var ver = "2025.5.1 Dev";

/* Load some stuff */
$.ajax({
  url: "/json/files.json",
  dataType: "text",
  success: function(data) {
    files = JSON.parse(data);
  }
});

$.ajax({
  url: "/json/games.json",
  dataType: "text",
  success: function(data) {
    games = JSON.parse(data);
  }
});

$.ajax({
  url: "/json/links.json",
  dataType: "text",
  success: function(data) {
    links = JSON.parse(data);
  }
});

$(document).ready(function() {
  /* Set theme */
  if (localStorage.getItem("theme")) {
    $("html").removeClass("dark");
    $("html").addClass(localStorage.getItem("theme"));
    $(".bg-thumbnail.active").removeClass("selected");
    $(".bg-thumbnail.active[value=" + localStorage.getItem("theme") + "]").addClass("selected");
  }
  /* Set accent color */
  if (localStorage.getItem("accent")) {
    $(":root").css("--accent-color", "rgb(" + localStorage.getItem("accent") + ")");
    $(":root").css("--accent-rgb", localStorage.getItem("accent"));
    $(".bg-accent").removeClass("selected");
    $(".bg-accent[style*='background-color: " + localStorage.getItem("accent") + "']").addClass("selected");
  }
  $(".panel").css("bottom", "-48px");
  $(".login-system").text("CoffeeOS " + ver);
  $(".system-version").text(ver)
  $(".login").show("fade", 250);
  $(".login-password").focus();
  
  /* Set background */
  setTimeout(function() {
    $(function() {
      rbg();
      /* Check if background image is already set */
      if (localStorage.getItem("bgImage")) {
        $("body, .bg-thumbnail.active").css("backgroundImage", localStorage.getItem("bgImage"));
        $(".bg-thumbnail:not(.active)").removeClass("selected");
        
        if (localStorage.getItem("bgImage").indexOf("linear-gradient") != -1) {
          $(".bg-thumbnail:not(.active)[style*='background-image: " + localStorage.getItem("bgImage") + "']").addClass("selected");
        }
        if (localStorage.getItem("bgSize") && localStorage.getItem("bgPos")) {
          $("body, .bg-thumbnail.active").css("backgroundSize", localStorage.getItem("bgSize"));
          $("body, .bg-thumbnail.active").css("backgroundPosition", localStorage.getItem("bgPos"));
          
          $("#bg-url").val(localStorage.getItem("bgImage").substr(5).slice(0, -2));
          $("#bg-type").val(localStorage.getItem("bgSize"));
          $("#bg-pos").val(localStorage.getItem("bgPos"));
        }
      }
    });
  }, 250);
  
  /* Set username and avatar */
  if (localStorage.getItem("userName")) {
    user = localStorage.getItem("userName");
    $(".login-name").text(user);
    $("#currentUser").text(user.toLowerCase());
    $("#user-username").val(localStorage.getItem("userName"));
    $(".current-dir").val("/home/" + user.toLowerCase());
  }
  if (localStorage.getItem("userAvatar")) {
    $(".login-avatar, .settings-avatar").attr("src", localStorage.getItem("userAvatar"));
    $("#user-avatar").val(localStorage.getItem("userAvatar"));
  }
  
  /* Custom CSS */
  if (localStorage.getItem("customCss")) {
    $("head").append("<link rel='stylesheet' href='" + localStorage.getItem("customCss") + "' custom='1'></link>");
    $("#custom-stylesheet").val(localStorage.getItem("customCss"));
  }
  /* Custom font */
  if (localStorage.getItem("customFont")) {
    $("body").css("fontFamily", localStorage.getItem("customFont"));
    $("#custom-font").val(localStorage.getItem("customFont"));
  }
  
  /* Generate background color */
  function rbg() {
    var letters = '0123456789ABCDEF';
    var c1 = '#', c2 = '#';

    for (var i = 0; i < 6; i++) {
      c1 += letters[Math.floor(Math.random() * 16)];
      c2 += letters[Math.floor(Math.random() * 16)];
    }
    $("body").css("backgroundImage", "linear-gradient(" + c1 + ", " + c2 + ")");
    $(".bg-thumbnail.active").css("backgroundImage", "linear-gradient(" + c1 + ", " + c2 + ")");
  }
  
  /* Context menu */
  $(".desktop").on("contextmenu", function(e) {
    e.preventDefault();
    cmActive = true;
    
    $("#cm-d").css({
      display: "block",
      left: e.pageX,
      top: e.pageY
    });
    setTimeout(function() {
      cmActive = false;
    }, 150);
  });
  
  $("#cm-newfolder").click(function() {
    $(".desktop-icons").append("<div class='file'><img class='file-icon' src='/assets/icons/default/places/folder.svg'><label class='file-name' id='file-rename' spellcheck='false' contenteditable='true'>New folder</label></div>");
    $("#file-rename").focus();
  });
  
  $(document).on("focusout", "#file-rename", function() {
    if ($("#file-rename").text() == "") {
      $("#file-rename").text("New folder");
    }
    if ($("#file-rename").parents(".files-list").length == 1) {
      files.home.push($("#file-rename").text());
      filesReload();
    }
    $("#file-rename").removeAttr("id contenteditable");
  });
  
  $("#cm-background").click(function() {
    $(".settings-content").hide();
    $("#settings-appearance").show();
    $("#settings .sidebar li").removeClass("active");
    $("#sb-item-appearance").addClass("active");
    
    openApp("#settings", "rt");
  });
  
  $("#cm-settings").click(function() {
    openApp("#settings", "rt");
  });
  
  $("body").mouseup(function(e) {
    if (cmActive != true) {
      $("#cm-d").hide("fade", 100);
    }
  });
  
  /* Desktop start up */
  $(".login-button").click(function() {
    $(".login, .environment").fadeToggle(100);
    $(".login input").val("");
    
    if (firstLg == false) {
      $(".panel").delay(400).animate({ bottom: "0" });
      $(".desktop").delay(400).animate({ opacity: "1" });
      if (!localStorage.getItem("visited")) {
        setTimeout(function() {
          openApp("#intro", "rt");
        }, 1000);
        firstLg = true;
        localStorage.setItem("visited", "true");
      }
      else {
        $("#intro-toast").hide();
      }
      $.each(apps, function(i) {
        $("#app-list").append("<option>" + apps[i] + "</option>");
      });
    }
  });
  
  /* Window */
  function windowDrag() {
    $(".window").draggable({
      handle: ".csd",
      iframeFix: true,
      start: function() {
        $(this).css({
          borderRadius: "",
          borderWidth: ""
        });
        $(".overlay").show();
        $(this).css("cursor", "move");
      },
      stop: function() {
        $(".overlay").hide();
        $(this).css("cursor", "");
      }
    });
  }
  
  function windowResize() {
    $(".window:not(.dialog)").resizable({
      handles: "n, e, s, w, se, sw, nw, ne",
      iframeFix: true,
      resize: function() {
        var w = Math.round($(this).width());
        var h = Math.round($(this).height());
        
        $(".res").finish().fadeIn(0).delay(500).fadeOut('slow');
        $("#res-val").text(w + ", " + h);
        
        if ($(this).attr("maximized") == 1) {
          $(this).removeAttr("prev-w prev-h prev-y prev-x maximized");
        }
        if ($(this).width() < 680) {
          $(this).addClass("responsive");
        }
        else {
          $(this).removeClass("responsive");
        }
      },
      start: function() {
        $(".overlay").show();
      },
      stop: function() {
        $(".overlay").hide();
      }
    });
  }
  
  function panelSort() {
    $(".panel-icons").sortable({
      items: ".app-tile",
      delay: 250,
      start: function() {
        iconDrag = true;
      },
      stop: function() {
        setTimeout(function() {
          iconDrag = false;
        });
      }
    });
  }
  
  $(function() {
    windowDrag();
    windowResize();
    panelSort();
  });
  
  /* Maximize window */
  $(document).on('dblclick', '.csd', function(e) {
    if(e.target !== e.currentTarget) {
      return;
    }
    maximizeWindow($(this).parent());
  });
  
  $(document).on('click', '.maximize-app', function() {
    maximizeWindow($(this).attr('value'));
  });
  
  function maximizeWindow(app) {
    if (!$(app).hasClass("dialog")) {
      if ($(app).attr("maximized") == 1) {
        $(app).animate({
          width: $(app).attr("prev-w"),
          height: $(app).attr("prev-h"),
          top: $(app).attr("prev-y"),
          left: $(app).attr("prev-x"),
        }, 250, "easeInOutQuint").css({
          borderRadius: "",
          borderWidth: ""
        });
        if ($(app).attr('prev-w').slice(0, -2) <= 680) {
          $(app).addClass('responsive');
        }
        $(app).removeAttr('prev-w prev-h prev-y prev-x maximized');
      }
      else {
        $(app).attr({
          "prev-w": $(app).css("width"),
          "prev-h": $(app).css("height"),
          "prev-x": $(app).css("left"),
          "prev-y": $(app).css("top"),
          "maximized": 1
        });
        $(app).animate({ 
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          borderRadius: 0,
          borderWidth: 0
        }, 250, "easeInOutQuint");
        
        if ($(app).hasClass('responsive') && $(document).width() > 680) {
          $(app).removeClass('responsive');
        }
      }
    }
  }
  
  /* Focus window */
  $(document).on("mousedown", ".window", function() {
    focusWindow("#" + this.id);
  })
  
  function focusWindow(app) {
    var wv = $(".window:visible").length + $(".app-tile[minimized='1']").length;
    var ap = app.substr(1);
    
    $(".window").not(app).addClass("unfocused");
    if ($.inArray(ap, proc) > -1) {
      proc.splice($.inArray(ap, proc), 1);
    }
    proc.push(ap);
    for (var i = proc.length; i > 0; i--) {
      $("#" + proc[i - 1]).css("z-index", i);
    }
    $(app).css("z-index", wv);
    $(app).removeClass("unfocused");
    
    $(".app-tile").not(app).removeClass("active-tile");
    $(app + "-p").addClass("active-tile");
  }
  
  $(document).on("click", ".minimize-app", function() {
    minimizeWindow($(this).attr("value"));
  });
  
  /* Minimize window */
  function minimizeWindow(app) {
    plsWait = true;
    $(app).attr({
      "prev-x": $(app).css("left"),
      "prev-y": $(app).css("top")
    });
    $(app).addClass("window-minimize");
    $(app).animate({
      "top": $(app + "-p")[0].getBoundingClientRect().top + 48,
      "left": $(app + "-p")[0].getBoundingClientRect().left - ($(app).width() - $(app + "-p").width()) 
    }, 250);
    $(app + "-ai").css("width", "16px");
    $(app + "-p").removeClass("active-tile");
    setTimeout(function() {
      $(app).hide();
      $(app + "-p").attr("minimized", 1);
      $(app).removeClass("window-minimize");
      plsWait = false;
    }, 250);
  }
  
  /* Open window */
  $(".panel-icons, #drawer").on("click", ".open-app", function(e) {
    var app = $(this).attr('value');
    
    if (iconDrag || plsWait) {
      return;
    }
    else if ($(app).is(":visible") == true && $(app).css("z-index") != proc.length) {
      focusWindow(app);
    }
    else if ($(app).is(":visible") == true && $(app).css("z-index") == proc.length) {
      minimizeWindow(app);
    }
    else if ($(app + "-p").attr("minimized") == 1) {
      plsWait = true;
      $(app).show();
      $(app).addClass("window-unminimize");
      $(app).animate({
        "top": $(app).attr("prev-y"),
        "left": $(app).attr("prev-x"),
      }, 250);
      $(app).removeAttr("prev-y prev-x");
      
      $(app + "-ai").removeAttr("style");
      $(app + "-p").removeAttr("minimized");
      setTimeout(function() {
        $(app).removeClass("window-unminimize");
        plsWait = false;
      }, 250);
      focusWindow(app);
    }
    else {
      openApp(this, "pd");
    }
  });
  
  function openApp(app, src) {
    if (src != "rt") {
      var app = $(app).attr('value');
    }
    if ($(app).is(":visible")) {
      return;
    }
    if ($(app).length) {
      var it = $(app + " .csd-title").text();
      var ic = $(app + " .csd img").attr("src");
      
      // Check if app is pinned
      if ($(app + "-p").attr("pinned") != 1) {
        $(".panel-icons").append("<div class='app-tile open-app' id='" + app.substr(1) + "-p' value='" + app + "' title='" + it + "' pinned='0' style='display: none;'><img class='app-icon' src='" + ic + "'><div class='active-ind' id='" + app.substr(1) + "-ai' style='display: none;'></div></div>");
        $(app + "-p").show("fade", 100);
      }
      $(app).css("top", Math.max(0, (($(window).height() - $(app).outerHeight()) / 2)) + "px");
      $(app).css("left", Math.max(0, (($(window).width() - $(app).outerWidth()) / 2)) + "px");
      $(app).addClass("window-open");
      $(app).show("fade", 100);
      $(app + "-p img").addClass("icon-animate");
      $(app + "-p").attr("opened", 1);
      $(app + "-p").append("<label class='app-name' style='display: none;'>" + it + "</label>")
      
      $("#drawer").hide("fade", 100);
      $(app + "-ai").show("clip", { direction: "horizontal" }, 100);
      
      specialApps(app);
      setTimeout(function() {
        $(app).removeClass("window-open");
        focusWindow(app);
      }, 110);
      setTimeout(function() {
        $(app + "-p img").removeClass("icon-animate");
      }, 500);
    }
  }
  
  /* Close window */
  $(document).on("click", ".close-app", function() {
    closeApp(this, "wi");
  });
  
  function closeApp(app, src) {
    if (src != "rt") {
      app = $(app).attr("value");
    }
    $(app).hide("fade", 100);
    if ($(app + "-p").length) {
      $(app + "-p").removeClass("active-tile");
      $(app + "-p").removeAttr("opened");
      $(app + "-p .app-name").remove();
      $(app + "-ai").hide("clip", {
        direction: "horizontal"
      }, 100);
      
      // Check if app is pinned
      if ($(app + "-p").attr("pinned") != 1) {
        $(app + "-p").hide("fade", 200);
        setTimeout(function() {
          $(app + "-p").remove()
        }, 100);
      }
    }
    $(app).addClass("window-close");
    proc.splice($.inArray(app.substr(1), proc), 1);
    specialAppsClose(app);
    setTimeout(function() {
      $(app).removeClass("window-close");
      if ($(app + ".external").length) {
        $(app).remove();
      }
    }, 100);
  }
  
  /* Run app */
  $("#run-app").keypress(function (e) {
    var key = e.which;

    if (key == 13) {
      var app = "#" + $("#run-app").val();

      // Convoluted problems require convoluted solutions
      if ($(app + ".window").length) {
        openApp(app, "rt");
        closeApp("#run", "rt");
        $("#run-app").val("");
      }
    }
  });
  
  /* Show desktop */
  $('.show-desktop').on('mouseover', function() {
    $('.window').addClass('fade');
  });
  
  $('.show-desktop').on('mouseout', function() {
    $('.window').removeClass('fade');
  });
  
  $('.show-desktop').on('click', function() {
    for (var i = 0; i < $('.window:visible').length; i++) {
      minimizeWindow('#' + $('.window:visible')[i].id);
    }
  });
  
  /* Desktop icons */
  $(".desktop-icons").sortable({
    start: function() {
      iconDrag = true;
    },
    stop: function() {
      iconDrag = false;
    }
  });
  
  $(document).on("click", ".file", function() {
    if (iconDrag) {
      return;
    }
    var file = $(this).attr("data-file");
    
    /* Open file in text editor */
    if (typeof file !== "undefined") {
      $.ajax({
        url: "/" + file,
        dataType: "text",
        success: function(data) {
          var lines = data.split('\n&nbsp;');
          $("#ed .csd-title").text(file);
          $("#editor-area").val(lines);
          
          $('.editor-preview').show();
          var converter = new showdown.Converter();
          $('.editor-preview').html(converter.makeHtml($('#editor-area').val()));
          
          openApp("#ed", "rt");
        }
      });
    }
  });
  
  /* Sidebar */
  $('.sidebar-button').on('click', function() {
    if ($(this).parents('.window').find('.sidebar.open').length) {
      $(this).parents('.window').find('.sidebar').removeClass('open');
    }
    else {
      $(this).parents('.window').find('.sidebar').addClass('open');
    }
  });
  
  $('.sidebar-item').on('click', function() {
    $(this).parents('.window').find('.sidebar').removeClass('open');
  });
  
  /* Toast */
  $('.toast-close').on('click', function() {
    $(this).parent().hide('fade', 100);
  });
  
  /* Introduction */
  $("#intro .sidebar-item").click(function() {
    var sel = $(this).text().toLowerCase();
    
    if ($(".intro-content#intro-" + sel).length) {
      $("#intro .sidebar-item").removeClass("active");
      $(this).addClass("active");
      $(".intro-content").not("#intro-" + sel).hide();
      $("#intro-" + sel).show("fade", 250);
    }
  });
  
  /* Introduction: Load markdown contents */
  $.ajax({
    url: "/README.md",
    dataType: "text",
    success: function(data) {
      var converter = new showdown.Converter();
      $("#intro-welcome").append(converter.makeHtml(data));
    }
  });
  
  $.ajax({
    url: "/COMMANDS.md",
    dataType: "text",
    success: function(data) {
      var converter = new showdown.Converter();
      $("#intro-commands").append(converter.makeHtml(data));
    }
  });
  
  $.ajax({
    url: "/CHANGELOG.md",
    dataType: "text",
    success: function(data) {
      var converter = new showdown.Converter();
      $("#intro-changelog").append(converter.makeHtml(data));
    }
  });
  
  $.ajax({
    url: "/MOCHA.md",
    dataType: "text",
    success: function(data) {
      var converter = new showdown.Converter();
      $("#intro-toolkit").append(converter.makeHtml(data));
    }
  });
  
  /* File Manager */
  $(".current-dir").val("/home/" + user.toLowerCase());

  $("#files-refresh").click(function() {
    filesReload();
    $(".files-list").fadeOut(10).fadeIn(10);
  });
  
  function filesReload() {
    $(".files-list").empty();
    for (var i = 0; i < files.home.length; i++) {
      $(".files-list").prepend("<div class='file'><img class='file-icon' src='/assets/icons/default/places/folder.svg'><label class='file-name'>" + files.home[i].name + "</label></div>");
    }
    $(".files-list").append("<div class='file' data-file='CHANGELOG.md'><img class='file-icon' src='/assets/icons/default/mimetypes/markdown.svg'><label class='file-name'>CHANGELOG.md</label></div>");
    $(".files-list").append("<div class='file' data-file='COMMANDS.md'><img class='file-icon' src='/assets/icons/default/mimetypes/markdown.svg'><label class='file-name'>COMMANDS.md</label></div>");
    $(".files-list").append("<div class='file' data-file='MOCHA.md'><img class='file-icon' src='/assets/icons/default/mimetypes/markdown.svg'><label class='file-name'>MOCHA.md</label></div>");
    $(".files-list").append("<div class='file' data-file='README.md'><img class='file-icon' src='/assets/icons/default/mimetypes/markdown.svg'><label class='file-name'>README.md</label></div>");
  }
  
  $("#files-newfolder").click(function() {
    $(".files-list").append("<div class='file'><img class='file-icon' src='/assets/icons/default/places/folder.svg'><label class='file-name' id='file-rename' spellcheck='false' contenteditable='true'>New folder</label></div>");
    $("#file-rename").focus();
  });
  
  /* Text Editor */
  $("#editor-area").on("keydown keypress keyup click", function(e) {
    var lines = this.value.substr(0, this.selectionStart).split("\n");
    var lineNum = lines.length;
    var colIndex = lines[lines.length - 1].length;
    
    $("#ed-ln-cl").text("Ln " + lineNum + ", Col " + colIndex);
    $("#ed-state").text("");
  });
  
  $("#ed-new").click(function() {
    $("#editor-area").val("");
    $("#ed-of").val("");
    $("#ed .csd-title").text("Untitled");
  });
  
  $("#ed-open").click(function() {
    $("#ed-of").click();
  });
  
  function readEd(file, callback, encoding) {
    var reader = new FileReader();
    reader.addEventListener('load', function (e) {
      callback(this.result);
    });
    if (encoding) {
      reader.readAsText(file, encoding);
    }
    else {
      reader.readAsText(file);
    }
  }

  function edFile(i, o) {
    if (i.files && i.files[0]) {
      readEd(i.files[0], function (str) { $(o).val(str); });
    }
  }

  $("#ed-of").on("change", function () {
    edFile(this, "#editor-area");
    
    var file = $("#ed-of").val();
    $("#ed .csd-title").text(file.split("\\").pop());
    $("#ed-state").text("File opened: " + file.split("\\").pop());
  });
  
  $("#ed-save").click(function() {
    var text = document.getElementById("editor-area").value;
    text = text.replace(/\n/g, "\r\n");
    var blob = new Blob([text], { type: "text/plain"});
    var anchor = document.createElement("a");

    anchor.download = $("#ed .csd-title").text();
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target = "_blank";
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    $("#ed-state").text("File saved as: " + $("#ed .csd-title").text());
  });

  $("#ed-exit").click(function() {
    $("#editor-area").val("");
    $("#ed-of").val("");
    $("#ed .csd-title").text("Untitled");

    closeApp("#ed", "rt");
  });
  
  $("#ed .csd-title").click(function() {
    $("#ed .csd-title").hide();
    $("#ed-rename").text($("#ed .csd-title").text()).show().focus();
  });

  $("#ed-rename").focusout(function() {
    edRename();
  }).keydown(function(e) {
    if (e.which == 13) {
      edRename();
    }
  });
  
  function edRename() {
    $("#ed-rename").hide();
    $("#ed .csd-title, #ed-p .app-name").text("Untitled");
    if (!$("#ed-rename").text() == "") {
      $("#ed .csd-title, #ed-p .app-name").text($("#ed-rename").text());
    }
    if ($('#ed-rename').text().substr(-3) == '.md') {
      $('#ed-md').show();
    }
    else {
      $('#ed-md').hide();
    }
    $("#ed .csd-title").show();
  }

  $("#ed-fs-i").click(function() {
    var fs = parseInt($("#editor-area").css("fontSize"));
    $("#editor-area").css("fontSize", (fs + 1) + "px");
  });
  
  $("#ed-fs-d").click(function() {
    var fs = parseInt($("#editor-area").css("fontSize"));
    $("#editor-area").css("fontSize", (fs - 1) + "px");
  });
  
  $("#ed-wrap").click(function() {
    if ($("#editor-area").css("white-space") == "pre") {
      $("#editor-area").css("white-space", "revert");
    }
    else {
      $("#editor-area").css("white-space", "pre");
    }
  });
  
  $('#ed-md').on('click', function() {
    $('.editor-preview').toggle();
    
    var converter = new showdown.Converter();
    $('.editor-preview').html(converter.makeHtml($('#editor-area').val()));
  });
  
  /* Calculator */
  $(".calc-append").click(function() {
    $("#calc-input").val($("#calc-input").val() + $(this).attr("value"));
  });

  $("#calc-equal").click(function() {
    $("#calc-input").val(eval($("#calc-input").val()));
  });
  
  $("#calc-delete").click(function() {
    $("#calc-input").val($("#calc-input").val().slice(0, -1));
  });

  $("#calc-clear").click(function() {
    $("#calc-input").val("");
  });
  
  /* Focus terminal prompt */
  $("#term, .terminal-content").click(function() {
    $("#prompt").focus();
  });
  
  /* Append terminal output */
  $("#prompt").keydown(function (e) {
    var key = e.which;
    var pat = /^[A-Za-z0-9 '.-]+$/;
    termScrollToBottom();
    
    if (key == 13) {
      $("#buffer").append("<li><span class='ps'><span style='color: #1aec0f;'>" + user.toLowerCase() + "@coffeeos</span>:<span style='color: #3f7e90; font-weight: bold;'>~</span>$ </span><span class='term-input'></span></li>");
      $("#buffer li:last-child .term-input").text($("#prompt").text());
      var com = $("#prompt").text().split(' ')[0];
      var par = $("#prompt").text().split(' ')[1];
      
      if (com == "sudo") {
        $("#buffer").append("<li>" + user.toLowerCase() + " is not in the sudoers file. This incident will be reported.</li>");
      }
      else if (com == "neofetch") {
        $("#buffer").append("<li><pre>          c   c  c      <span style='color: #fce94f;'>" + user.toLowerCase() + "</span>@<span style='color: #fce94f;'>coffeeos</span></pre></li>");
        $("#buffer").append("<li><pre>          K;  K; K;     -----------------------</pre></li>");
        $("#buffer").append("<li><pre>          :0  :0 :0     <span style='color: #fce94f;'>OS</span>: CoffeeOS " + ver + "</pre></li>");
        $("#buffer").append("<li><pre>           k   k  k     <span style='color: #fce94f;'>Kernel</span>: 1.4-caff-1</pre></li>");
        $("#buffer").append("<li><pre>           '   '  '     <span style='color: #fce94f;'>Uptime</span>: " + Math.round(up / 60) + " mins</pre></li>");
        $("#buffer").append("<li><pre>      .''''d''d''d'''   <span style='color: #fce94f;'>Packages</span>: 55</pre></li>");
        $("#buffer").append("<li><pre>     KXXXXXXXXXXXXXXK   <span style='color: #fce94f;'>Resolution</span>: " + $(window).width() + "x" + $(window).height() + "</pre></li>");
        $("#buffer").append("<li><pre>    dXd KXXXXXXXXXXXK   <span style='color: #fce94f;'>Shell</span>: csh 0.13.0-alpha</pre></li>");
        $("#buffer").append("<li><pre>    KX  0XXXXXXXXXXXK   <span style='color: #fce94f;'>DE</span>: Caffeine</pre></li>");
        $("#buffer").append("<li><pre>    KX  0XXXXXXXXXXXK   <span style='color: #fce94f;'>Terminal</span>: term</pre></li>");
        if (!localStorage.getItem("customCss")) {
          $("#buffer").append("<li><pre>    .KXdXXXXXXXXXXXXd   <span style='color: #fce94f;'>Theme</span>: Mocha</pre></li>");
        }
        else {
          $("#buffer").append("<li><pre>    .KXdXXXXXXXXXXXXd   <span style='color: #fce94f;'>Theme</span>: Mocha (custom)</pre></li>");
        }
        $("#buffer").append("<li><pre>      dKKXXXXXXXXXXXX;  <span style='color: #fce94f;'>Icons</span>: Papirus+Feather</pre></li>");
        $("#buffer").append("<li><pre>         OXXXXXXXXXO    </pre></li>");
        $("#buffer").append("<li><pre>          ckKKKXKkc     </pre></li>");
      }
      else if (com == "ls") {
        $("#buffer").append("<li class='ls'><pre></pre></li>");
        for (var i = 0; i < files.home.length; i++) {
          $(".ls:last-child pre").append("<span style='color: #3f7e90; font-weight: bold;'>" + files.home[i].name + "  </span>");
        }
        $(".ls:last-child pre").append("<span>CHANGELOG.md  </span>");
        $(".ls:last-child pre").append("<span>COMMANDS.md  </span>");
        $(".ls:last-child pre").append("<span>MOCHA.md  </span>");
        $(".ls:last-child pre").append("<span>README.md</span>");
        filesReload();
      }
      else if (com == "cd") {
        $("#buffer").append("<li>cd: permission denied</li>");
      }
      else if (com == "mkdir") {
        if (!par == "") {
          if (pat.test(par)) {
            for (let i in files.home) {
              if (files.home[i].name == par) {
                $("#buffer").append("<li>mkdir: cannot create directory '" + par + "': Directory exists</li>");
                break;
              }
              else {
                // files.push($("#prompt").text().substr(6));
                filesReload();
                break;
              }
            }
          }
          else {
            $("#buffer").append("<li>mkdir: error: special characters not allowed</li>");
          }
        }
        else {
          $("#buffer").append("<li>mkdir: missing operand</li>");
        }
      }
      else if (com == "rm") {
        if (!par == "") {
          if ($.inArray(par, files.home) > -1) {
            files.home.splice($.inArray(par, files.home), 1);
            filesReload();
          }
          else {
            $("#buffer").append("<li>rm: cannot remove '" + par + "': No such file or directory</li>");
          }
        }
        else {
          $("#buffer").append("<li>rm: missing operand</li>");
        }
      }
      else if (com == "pwd") {
        $("#buffer").append("<li>/home/" + user.toLowerCase() + "</li>");
      }
      else if (com == "whoami") {
        $("#buffer").append("<li>user</li>");
      }
      else if (com == "echo") {
        $("#buffer").append("<li><span class='term-output'></span></li>");
        $("#buffer li:last-child .term-output").text($("#prompt").text().substr(5));
      }
      else if (com == "cat") {
        $.ajax({
          url: "/" + par,
          dataType: "text",
          success: function(data) {
            var lines = data.split('\n&nbsp;');

            $.each(lines, function() {
              $("#buffer").append("<li><pre><span class='term-output'></span></pre></li>");
              $("#buffer li:last-child .term-output").text(this);
            });
            termScrollToBottom();
          },
          error: function() {
            $("#buffer").append("<li>cat: " + par + ": No such file or directory</li>");
            termScrollToBottom();
          }
        });
      }
      else if (com == "history") {
        for (var i = 0; i < hist.length; i++) {
          $("#buffer").append("<li><pre>\t" + (i + 1) + " <span class='term-output'></span></pre></li>");
          $("#buffer li:last-child .term-output").text(hist[i]);
        }
      }
      else if (com == "clear") {
        $("#buffer").empty();
      }
      else if (com == "shutdown") {
        $("body").fadeOut(200).delay(2000).fadeIn(200, function() {
          $("#buffer").append("<li>Just kidding</li>");
        });
      }
      else if (com == "reboot") {
        $("body").fadeOut(200).delay(2000, function() {
          location.reload();
        });
      }
      else if (com == "rbg") {
        rbg();
      }
      else if (com == "pin") {
        if ($.inArray(par, apps) > -1) {
          var app = "#" + par;

          if ($(app + "-p").attr("pinned") == 1) {
            $("#buffer").append("<li>pin: program or command '" + par + "' already pinned</li>");
          }
          else if ($(app).is(":visible")) {
            $(app + "-p").attr("pinned", 1);
          }
          else {
            var it = $(app + " .csd-title").text();
            var ic = $(app + " .csd img").attr("src");
            
            $(".panel-icons").append("<div class='app-tile open-app' id='" + par + "-p' value='#" + par + "' title='" + it + "' pinned='1'><img class='app-icon' src='" + ic + "'><div class='active-ind' id='" + par + "-ai' style='display: none;'></div></div>");
          }
        }
        else {
          $("#buffer").append("<li>pin: program or command '" + par + "' not found</li>");
        }
      }
      else if (com == "unpin") {
        if ($.inArray(par, apps) > -1) {
          var app = "#" + par;

          if ($(app).is(":visible")) {
            $(app + "-p").attr("pinned", 0);
          }
          else {
            $(app + ("-p")).remove();
          }
        }
        else {
          $("#buffer").append("<li>unpin: program or command '" + par + "' not found</li>");
        }
      }
      else if (com == "exit") {
        closeApp("#term", "rt");
        $("#buffer").empty();
      }
      else if (com == "coffee") {
        $("#buffer").append("<li>*sips coffee* Nothing to see here</li>");
      }
      else if (com == "image") {
        if (par != "") {
          $(".image-img").attr("src", par);
          $(".image-open").hide();
          openApp("#image", "rt");
        }
        else {
          $("#buffer").append("<li>image: missing operand</li>");
        }
      }
      else if (com == "help") {
        $("#buffer").append("<li>plz refer to the introduction in the commands section or the COMMAND.md file, i'm too lazy to put things here</li>");
      }
      else {
        if ($.inArray(com, apps) > -1) {
          var app = "#" + $("#prompt").text();

          if ($(app).is(":visible")) {
            $("#buffer").append("<li>error: process '" + app.substr(1) + "' already running</li>");
          }
          else {
            openApp(app, "rt");
            specialApps(app);
          }
        }
        else if (com != "") {
          $("#buffer").append("<li>csh: command not found: " + com + "</li>");
        }
      }
      hist.push($("#prompt").text());
      hl = hist.length;
      $("#prompt").text("");
      return false;
    }
    else if (key == 38) {
      if (hl > 0) {
        hl--;
        $("#prompt").focus().text(hist[hl]);
      }
    }
    else if (key == 40) {
      if (hl < hist.length) {
        hl++;
        $("#prompt").focus().text(hist[hl]);
      }
    }
  });
  
  function termScrollToBottom() {
    $(".terminal-content").animate({
      scrollTop: $(".terminal-content").get(0).scrollHeight
    }, 50);
  }

  /* App Drawer */
  $("#open-drawer").click(function() {
    $("#drawer").toggle("fade", 100);
  });
  
  /* Wi-Fi */
  $("#open-wifi").click(function() {
    $("#wifi").toggle("fade", 100);
  });
  
  /* Sound */
  $("#open-sound").click(function() {
    $("#sound").toggle("fade", 100);
  });
  
  $(document).on("input", ".volume-range", function() {
    $(".volume-ind").html($(this).val());
  });
  
  /* Brightness */
  $("#open-brightness").click(function() {
    $("#brightness").toggle("fade", 100);
  });
  
  $(document).on("input", ".brightness-range", function() {
    $("body").css("filter", "brightness(" + $(this).val() + "%)");
  });
  
  /* Hide pop up when not focused */
  $("body").mouseup(function(e) {
    if (!$("#drawer").is(e.target) && $("#drawer").has(e.target).length === 0) {
      if ($("#drawer").is(":visible")) {
        setTimeout(function() {
          $("#drawer").hide("fade", 100);
        }, 50);
      }
    }
    if (!$("#wifi").is(e.target) && $("#wifi").has(e.target).length === 0) {
      if ($("#wifi").is(":visible")) {
        setTimeout(function() {
          $("#wifi").hide("fade", 100);
        }, 50);
      }
    }
    if (!$("#sound").is(e.target) && $("#sound").has(e.target).length === 0) {
      if ($("#sound").is(":visible")) {
        setTimeout(function() {
          $("#sound").hide("fade", 100);
        }, 50);
      }
    }
    
    if (!$("#brightness").is(e.target) && $("#brightness").has(e.target).length === 0) {
      if ($("#brightness").is(":visible")) {
        setTimeout(function() {
          $("#brightness").hide("fade", 100);
        }, 50);
      }
    }
  });
  
  /* Web */
  $('#web-bar').keydown(function (e) {
    var key = e.which;
    
    if (key == 13) {
      if ($(this).val().substr(0, 8) != 'https://') {
        if ($(this).val().substr(0, 7) == 'http://') {
          $(this).val($(this).val().substr(8));
        }
        var ht = 'https://' + $(this).val();
        $(this).val(ht);
      }
      $('.web-homepage').hide();
      $('#web-page').show();
      $('#web-page').attr('src', $(this).val());
      $(this).blur();
    }
  });
  
  $('#web-refresh').click(function() {
    $('#web-page').attr('src', function(i, val) { return val; });
  });
  
  $('#web-home').click(function() {
    $('#web-page').attr('src', '').hide();
    $('.web-homepage').show();
    $('#web-bar').val('');
  });
  
  $("#web-menu-exit").click(function() {
    $("#web-page").attr("src", "");
    $("#web-bar").val("");
    closeApp("#web", "rt");
  });
  
  $(document).on('click', '.link-card', function() {
    $('#web-page').attr('src', $(this).data('link'));
    $('#web-bar').val($(this).data('link'));
    $('.web-homepage').hide();
    $('#web-page').show();
  });
  
  function linksReload() {
    $('.links').empty();
    for (var i = 0; i < links.links.length; i++) {
      $('.links').append('<div class="link-card load"><div class="link-card-favicon"><img src="' + links.links[i].icon +'"></div><label>' + links.links[i].name + '</label></div>');
      $('.link-card.load').data('name', links.links[i].name);
      $('.link-card.load').data('icon', links.links[i].icon);
      $('.link-card.load').data('link', links.links[i].link);
      $('.link-card.load').removeClass('load');
    }
  }
  
  /* Image Viewer */
  var imgScale = 100;
  var imgRotate = 0;
  var imgTime;
  
  $(".image-img").draggable();
  
  $(".image-view").on("mousemove click", function() {
    clearTimeout(imgTime);
    $(".image-controls").finish().show("fade", 100);
    
    imgTime = setTimeout(function() {
      $(".image-controls").hide("fade", 800);
    }, 1500);
  }).mouseleave(function() {
    clearTimeout(imgTime);
    $(".image-controls").hide("fade", 800);  
  })
    
  $(".image-img").click(function() {
    if ($(".image-open").is(":visible")) {
      $(".image-open").hide();
    }
  });
  
  $("#image-zoom-in").click(function() {
    if (imgScale >= 500) {
      return;
    }
    imgScale += 10;
    $(".image-img").css("transform", "scale(" + imgScale + "%) rotate(" + imgRotate + "deg)");
    $(".image-zoom-level").text(imgScale + "%");
  });
  
  $("#image-zoom-out").click(function() {
    if (imgScale <= 10) {
      return;
    }
    imgScale -= 10;
    $(".image-img").css("transform", "scale(" + imgScale + "%) rotate(" + imgRotate + "deg)");
    $(".image-zoom-level").text(imgScale + "%");
  });
  
  $("#image-scale-100").click(function() {
    imgScale = 100;
    
    $(".image-img").removeAttr("style");
    $(".image-img").css("transform", "scale(100%) rotate(" + imgRotate + "deg)");
    $(".image-zoom-level").text(imgScale + "%");
  });
  
  $("#image-ori-scale").click(function() {
    imgScale = 100;
  
    $(".image-img").css({
      height: "auto",
      top: "50%"
    });
    $(".image-img").css("transform", "scale(100%) rotate(" + imgRotate + "deg) translateY(-50%)");
  });
  
  $("#image-rotate").click(function() {
    imgRotate += 90;
    
    if (imgRotate >= 360) {
      imgRotate = 0;
    }
    $(".image-img").removeAttr("style");
    $(".image-img").css("transform", "scale(" + imgScale + "%) rotate(" + imgRotate + "deg)");
  });
  
  $("#image-load").click(function() {
    if ($(".image-open").is(":visible")) {
      $(".image-open").hide();
    }
    else {
      $(".image-open").show();
      $("#image-url").focus();
    }
  });
  
  $("#load-image").click(function() {
    $(".image-img").attr("src", $("#image-url").val());
    $(".image-open").hide();
  })
  
  /* Playground */
  var cln = 0;
  var sp = 2;
  var lr = 0;
  var lri;
  
  var e_html = CodeMirror.fromTextArea(document.querySelector('#pg-tb-html'), {
    lineWrapping : false,
    lineNumbers: true,
    theme: 'material',
    mode:  'htmlmixed',
    autoRefresh: true,
    styleActiveLine: true,
    fixedGutter: true,
    lint: true,
    coverGutterNextToScrollbar: false,
    gutters: ['CodeMirror-lint-markers']
  });
  
  $("#pg-run").click(function() {
    pgRunApp();
  });
  
  function pgRunApp() {
    $("#pg-html").css("backgroundColor", "#ffffff");
    $("#pg-state").text("Loading page...");
    $("#pg-loading").fadeIn(10);
    try {
      var st = new Date().getTime();
      
      $("#pg-html").attr("src", function(i, val) { return val; });
      $("#pg-html").contents().find("html").html($("#pg-tb-html").val());
      if ($("#pg-external-script").val() != "") {
        $("#pg-html").contents().find("head").append("<scr" + "ipt src='" + $("#pg-external-script").val() + "'>" + "</scr" + "ipt>");
      }
      if ($("#pg-js-lib").val() != "js") {
        $("#pg-html").contents().find("head").append("<scr" + "ipt type='text/javascript' src='https://code.jquery.com/jquery-3.6.0.min.js'></scr" + "ipt>");
      }
      $("#pg-html").contents().find("head").append("<style></style>");
      $("#pg-html").contents().find("style").html($("#pg-tb-css").val());
      $("#pg-html").contents().find("body").append("<scr" + "ipt>" + $("#pg-tb-js").val() + "</scr" + "ipt>");
      
      $("#pg-state").text("Page loaded successfully (" + (new Date().getTime() - st) + "ms)");
    }
    catch(e) {
      var err = "<span style='color: #c4a001; font-weight: bold;'>" + e.toString().split(" ")[0] + "</span>";
      $("#pg-con").append("<li>" + err + " " + e.toString().substr(e.toString().indexOf(" ") + 1) + "</li>");
      $("#pg-con-count").text($("#pg-con li").length);
      
      $(".pg-console").animate({
        scrollTop: $(".pg-console").get(0).scrollHeight
      }, 50);
      $("#pg-state").text("Page loaded, but with errors. See Console for info (" + (new Date().getTime() - st) + "ms)");
    }
    $("#pg-loading").fadeOut(10);
  }
  
  $("#pg-scripts").click(function() {
    if (!$(".pg-context-menu").is(":visible") == true) {
      $(".pg-context-menu").removeAttr("style");
    }
    else if (!$(".pg-cm-select, .pg-cm-script").is(":focus")) {
      $(".pg-context-menu").hide();
    }
  });
  
  $("#playground").mouseup(function() {
    if (!$(".pg-cm-select, .pg-cm-script").is(":focus")) {
      $(".pg-context-menu").hide();
    }
  });
  
  $("#pg-clear").click(function() {
    var st = new Date().getTime();
    
    $("#pg-html").removeAttr("style");
    $("#pg-html").contents().find("html").html("");
    
    $("#pg-state").text("Page contents cleared (" + (new Date().getTime() - st) + "ms)");
  });
  
  function liveReload() {
    if (lr == 1) {
      clearTimeout(lri);
      
      lri = setTimeout(function() {
        pgRunApp();
      }, 500);
    }
  }
  
  $(".pg-textbox").on("keydown", function(e) {
    if (e.key == "Tab") {
      e.preventDefault();
      var s = this.selectionStart;
      var e = this.selectionEnd;
      
      if (sp == 1) { var sps = " "; }
      else if (sp == 2) { var sps = "  "; }
      else if (sp == 3) { var sps = "   "; }
      else if (sp == 4) { var sps = "    "; }

      this.value = this.value.substr(0, s) + sps + this.value.substr(e);
      this.selectionStart = this.selectionEnd = s + sp;
    }
    if (e.key == "Backspace") {
      liveReload()
    }
  }).on("keypress", function() {
    liveReload()
  }).on("keyup click", function(e) {
    updatePageNum(this);
    
    var pln = this.value.substr(0, this.selectionStart).split("\n");
    var wln = pln.length;
    var pcl = pln[pln.length - 1].length;
    
    $("#pg-line-col").text("Ln " + wln + ", Col " + pcl);
    $("#pg-state").text("");
  });
  
  function updatePageNum(textBox) {
    var sln = $(textBox).val().split("\n");
    var ln = sln.length;
    
    if (ln >= 1000) {
      $(".pg-ln").css("width", "46px");
    }
    else {
      $(".pg-ln").removeAttr("style");
    }
    
    if (cln != ln) {
      $(".pg-ln ul").empty();
      
      for (var i = 0; i < ln; i++) {
        $(".pg-ln ul").append("<li class='line-number'>" + (i + 1) + "</li>");
      }
    }
    cln = ln;
  }
  
  $(".pg-textbox").scroll(function() {
    $(".pg-ln").scrollTop($(this).scrollTop());
  });
  
  $("#pg-ori").click(function() {
    if ($(".pg-view").css("flex-direction") == "row") {
      $(".pg-view").addClass("column");
      $("#pg-ori svg").css("transform", "rotate(90deg)");
    }
    else {
      $(".pg-view").removeClass("column");
      $("#pg-ori svg").removeAttr("style");
    }
    $("#pg-sp-count").text(sp);
  });
  
  $(".pg-button:not(#pg-run, #pg-clear, #pg-ori, #pg-scripts)").click(function() {
    $(".pg-button").not(this).removeClass("active");
    $(".pg-textbox").not("#pg-" + this.id).hide();
    
    $(this).addClass("active");
    $("#pg-" + this.id).removeAttr("style");
    updatePageNum("#pg-" + this.id);
  });
  
  $("#pg-tab-spaces").click(function() {
    if (sp != 4) {
      sp++;
    }
    else {
      sp = 1;
    }
    $("#pg-sp-count").text(sp);
  });
  
  $("#pg-live-reload").click(function() {
    if (lr == 0) {
      lr = 1;
      $("#pg-lr-state").text("Enabled");
    }
    else {
      lr = 0;
      $("#pg-lr-state").text("Disabled");
    }
  });
  
  $("#pg-open-console").click(function() {
    if ($(".pg-console").is(":visible")) {
      $(".pg-console").hide();
    }
    else {
      $(".pg-console").show();
    }
  });
  
  $(".pg-console").resizable({
    handles: "n",
    iframeFix: true,
    maxHeight: 300,
    resize: function() {
      $(this).css("top", "");
    },
    start: function() {
      $(".overlay").show();
    },
    stop: function() {
      $(".overlay").hide();
    }
  });
  
  $.ajax({
    url: "/bin/pg/sample_html.html",
    dataType: "text",
    success: function(data) {
      $("#pg-tb-html").val(data);
    }
  });
  
  $.ajax({
    url: "/bin/pg/sample_css.css",
    dataType: "text",
    success: function(data) {
      $("#pg-tb-css").val(data);
      updatePageNum(document.querySelector("#pg-tb-html"));
      pgRunApp();
    }
  });
  
  /* Paint */
  var img_tmp = "";
  $("#paint-canvas").jqScribble();
  $("#paint-canvas").data("jqScribble").update({ width: 720, height: 480 });
  
  $("#paint-canvas").on("mouseup", function() {
    img_tmp = $("#paint-canvas")[0].toDataURL("");
  });
  
  $(document).on("click", ".paint-color:not(.custom)", function() {
    $("#paint-canvas").data("jqScribble").update({ brushColor: $(this).css("backgroundColor") });
    $(".paint-color").removeClass("selected");
    $(this).addClass("selected");
  });
  
  $("#paint-custom").click(function() {
    $("#paint-color-picker").trigger("click");
  });
  
  $("#paint-color-picker").change(function() {
    if ($(".paint-color:not(.custom)").length >= 15) {
      $(".paint-color:not(.custom)")[8].remove();
    }
    $(".paint-color.custom").before("<button type='button' class='paint-color' style='background-color: " + $(this).val() + ";''></button>");
    $(".paint-color").removeClass("selected");
    $(".paint-color[style='background-color: " + $(this).val() + ";']").addClass("selected");
    $("#paint-canvas").data("jqScribble").update({ brushColor: $(".paint-color.selected").css("backgroundColor") });
  });
  
  $("#paint-brush-size").change(function() {
    $("#paint-canvas").data("jqScribble").update({ brushSize: $(this).val() });
  });
  
  $("#paint .csd-title").click(function() {
    $(this).hide();
    $("#paint-rename").text($("#paint .csd-title").text()).show().focus();
  });

  $("#paint-rename").focusout(function() {
    paintRename();
  }).keydown(function(e) {
    if (e.which == 13) {
      paintRename();
    }
  });
  
  function paintRename() {
    $("#paint-rename").hide();
    $("#paint .csd-title, #paint-p .app-name").text("Untitled");
    if (!$("#paint-rename").text() == "") {
      $("#paint .csd-title, #paint-p .app-name").text($("#paint-rename").text());
    }
    $("#paint .csd-title").show();
  }
  
  $("#paint-open").click(function() {
    $("#paint-file").trigger("click");
  });
  
  $("#paint-save").click(function() {
    var link = document.createElement("a");
    link.download = $("#paint .csd-title").text() + ".png";
    link.href = $("#paint-canvas")[0].toDataURL("image/png");
    link.click();
    
    $("#paint-state").text("Saved image as: " + link.download);
  });
  
  $("#paint-clear").click(function() {
    $("#paint-canvas").data("jqScribble").clear();
    $("#paint-state").text("Image contents cleared");
  });
  
  $("#paint-viewer").click(function() {
    $(".image-img").attr("src", $("#paint-canvas")[0].toDataURL("image/png"));
    $(".image-open").hide();
    openApp("#image", "rt");
  });
  
  $(".paint-content").click(function() {
    $("#paint-state").text("");
  });
  
  $('#paint-file').change(function(e){
    var file = e.target.files[0], imageType = /image.*/;
    if (!file.type.match(imageType)) {
      $("#paint-state").text("Error: Not an image file");
      return;
    }
    var reader = new FileReader();
    
    $(reader).on("load", function(e) {
      var $img = $('<img>', { src: e.target.result });
      var canvas = $('#paint-canvas')[0];
      var context = canvas.getContext('2d');

      $($img).on("load", function() {
        $("#paint-canvas").css({ width: $img[0].naturalWidth, height: $img[0].naturalHeight });
        $(".paint-content .ui-wrapper").css({ width: $img[0].naturalWidth, height: $img[0].naturalHeight });
        $("#paint-canvas").data("jqScribble").update({ width: $img[0].naturalWidth, height: $img[0].naturalHeight });
        $("#paint-wh").text($img[0].naturalWidth + "x" + $img[0].naturalHeight);
        $("#paint-state").text("Image loaded successfully");
        
        context.drawImage(this, 0, 0);
        img_tmp = $("#paint-canvas")[0].toDataURL("");
      });
    });
    reader.readAsDataURL(file);
  });
  
  function checkPaint() {
    if ($("#paint").is(":visible")) {
      $("#paint-canvas").resizable({
        resize: function() {
          var img = new Image;
          img.src = img_tmp;
          var canvas = $('#paint-canvas')[0];
          var context = canvas.getContext('2d');

          $("#paint-canvas").data("jqScribble").update({ width: $("#paint-canvas").width(), height: $("#paint-canvas").height() });
          $("#paint-wh").text($(this).width() + "x" + $(this).height());
          context.drawImage(img, 0, 0);
        }
      });
    }
  }
  
  /* Emulator */
  $(document).on('click', '.emu-open-game', function() {
    openIframe($(this).data('name'), $(this).data('icon'), $(this).data('link'), $(this).data('width'), $(this).data('height'));
  });
  
  function gamesReload() {
    $(".emu-list").empty();
    for (var i = 0; i < games.games.length; i++) {
      $(".emu-list").append("<div class='file emu-open-game load'><img class='file-icon' src='" + games.games[i].icon + "'><label class='file-name'>" + games.games[i].name + "</label></div>");
      $(".emu-open-game.load").data("name", games.games[i].name);
      $(".emu-open-game.load").data("icon", games.games[i].icon);
      $(".emu-open-game.load").data("link", games.games[i].link);
      $(".emu-open-game.load").data("width", games.games[i].width);
      $(".emu-open-game.load").data("height", games.games[i].height);
      $(".emu-open-game.load").removeClass("load");
    }
  }
  
  /* Special apps: open */
  function specialApps(app) {
    if (app == "#vscode") {
      $("#if-vscode").attr("src", "https://github1s.com/");
    }
    else if (app == "#web") {
      $("#web-page").attr("src", "");
      $("#web-bar").val("");
      linksReload();
    }
    else if (app == "#playground") {
      $("#pg-con").append("<li>Welcome to the Playground console. Page errors and warnings will show up here</li>");
      $("#pg-con").append("<li>This is an early alpha version. Bugs are to be expected</li>");
      e_html.refresh();
    }
    else if (app == "#run") {
      $("#run-app").focus();
    }
    else if (app == "#files") {
      filesReload();
    }
    else if (app == "#emu") {
      gamesReload();
    }
    else if (app == "#paint") {
      checkPaint();
    }
  }
  
  /* Special apps: close */
  function specialAppsClose(app) {
    $("#if-" + app.substr(1)).attr("src", "");
    
    if (app == "#term") {
      $("#buffer").empty();
      $("#prompt").text("");
    }
    else if (app == "#ed") {
      $("#editor-area").val("");
      $("#ed-of").val("");
      $("#ed .csd-title").text("Untitled");
    }
    else if (app == "#playground") {
      $("#playground textarea").val("");
      $("#pg-html").removeAttr("style");
      $("#pg-html").contents().find("html").html("");
      $("#pg-con").empty();
      updatePageNum(document.querySelector("#pg-tb-html"));
    }
    else if (app == "#paint") {
      $("#paint .csd-title").text("Untitled");
      $("#paint-state").text("");
      $("#paint-canvas").data("jqScribble").clear();
    }
  }
  
  /* Experimental: For iframe windows */
  function openIframe(name, icon, link, width, height) {
    var win_name = name.toLowerCase().replace(/[^\w]/gi, '_') + "-" + Math.floor(Math.random() * 2147483647);
    var win_height = parseInt(height) + $(".csd").outerHeight();
    $('.environment').append('<div class="window external" id="' + win_name + '" style="display: none; width: ' + width + 'px; height: ' + win_height + 'px"><div class="csd"><img class="csd-icon" src="' + icon + '"><label class="csd-title">' + name + '</label><div class="csd-buttons"><i data-feather="chevron-down" class="csd-button minimize-app" value="#' + win_name + '"></i><i data-feather="chevron-up" class="csd-button maximize-app" value="#' + win_name + '"></i><i data-feather="x" class="csd-button close-app" value="#' + win_name +'"></i></div></div><iframe src="' + link + '" class="w-100 h-100" onload="this.focus();this.contentWindow.focus();" allowtransparency="true" allow="autoplay; fullscreen; accelerometer; gyroscope; geolocation; microphone; camera; midi; encrypted-media; clipboard-read; clipboard-write" sandbox="allow-forms allow-downloads allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation" frameborder="0"></iframe></div>');
    openApp("#" + win_name, "rt");
    windowDrag();
    windowResize();
    feather.replace();
  }
  
  /* Settings */
  $("#settings .sidebar-item").click(function() {
    var sel = $(this).text().toLowerCase();
    
    if ($(".settings-content#settings-" + sel).length) {
      $("#settings .sidebar-item").removeClass("active");
      $(this).addClass("active");
      $(".settings-content").not("#settings-" + sel).hide();
      $("#settings-" + sel).show("fade", 250);
    }
  });
  
  /* Change user details */
  $("#apply-user").click(function() {
    user = $("#user-username").val();
    $(".login-name").text(user);
    $("#currentUser").text(user.toLowerCase());
    localStorage.setItem("userName", user);
    
    if ($("#user-avatar").val() != "") {
      $(".login-avatar, .settings-avatar").attr("src", $("#user-avatar").val());
      localStorage.setItem("userAvatar", $("#user-avatar").val());
    }
  });
  
  /* Change background */
  $("#change-bg").click(function() {
    $("body, .bg-thumbnail.active").css({
      backgroundImage: "url('" + $("#bg-url").val() + "')",
      backgroundSize: $("#bg-type").val(),
      backgroundPosition: $("#bg-pos").val()
    });
    $(".bg-thumbnail:not(.active)").removeClass("selected");
    // Set background to localstorage
    localStorage.setItem("bgImage", "url('" + $("#bg-url").val() + "')");
    localStorage.setItem("bgSize", $("#bg-type").val());
    localStorage.setItem("bgPos", $("#bg-pos").val());
  });
  
  $(".bg-thumbnail:not(.active)").click(function() {
    $("body").css("backgroundImage", $(this).css("backgroundImage"));
    $(".bg-thumbnail.active").css("backgroundImage", $(this).css("backgroundImage"));
    $(".bg-thumbnail:not(.active)").removeClass("selected");
    $(this).addClass("selected");
    localStorage.setItem("bgImage", $(this).css("backgroundImage"));
  });
  
  $("#random-bg").click(function() {
    rbg();
    localStorage.setItem("bgImage", $("body").css("backgroundImage"));
    localStorage.removeItem("bgSize");
    localStorage.removeItem("bgPos");
  });
  
  /* Change accent color */
  $(".bg-accent").click(function() {
    var tmp_ac = $(this).css("backgroundColor").split("rgb(")[1];
    var ac = tmp_ac.split(")")[0];
    
    $(":root").css("--accent-color", $(this).css("backgroundColor"));
    $(":root").css("--accent-rgb", ac);
    $(".bg-accent").removeClass("selected");
    $(this).addClass("selected");
    localStorage.setItem("accent", ac);
  })
  
  /* Change theme */
  $(".bg-thumbnail.active").click(function() {
    if ($(this).attr("value") == "dark") {
      $("html").removeClass("light").addClass("dark crossfade");
      localStorage.setItem("theme", "dark");
    }
    else {
      $("html").removeClass("dark").addClass("light crossfade");
      localStorage.setItem("theme", "light");
    }
    $(".bg-thumbnail.active").removeClass("selected");
    $(this).addClass("selected");
    setTimeout(function() {
      $("html").removeClass("crossfade");
    }, 200);
  });
  
  /* Inject custom CSS */
  $("#apply-custom").click(function() {
    if (!$("#custom-stylesheet").val() == "") {
      $("link[custom='1']").remove();
      $("head").append("<link rel='stylesheet' href='" + $("#custom-stylesheet").val() + "' custom='1'></link>");
      localStorage.setItem("customCss", $("#custom-stylesheet").val());
    }
    else {
      $("link[custom='1']").remove();
      localStorage.removeItem("customCss");
    }
    if (!$("#custom-font").val() == "") {
      $("body").css("fontFamily", $("#custom-font").val());
      localStorage.setItem("customFont", $("#custom-font").val());
    }
    else {
      $("body").css("fontFamily", "");
      localStorage.removeItem("customFont");
    }
  });
  
  /* Open settings */
  $(".user-settings").click(function() {
    openApp("#settings", "rt");
    $("#drawer").hide("fade", 100);
  });
  
  /* Full screen */
  $(".fullscreen").click(function() {
    document.documentElement.requestFullscreen();
    $(".fullscreen, .exit-fs").toggle();
    $("#drawer").hide("fade", 100);
  });
  
  $(".exit-fs").click(function() {
    document.exitFullscreen();
    $(".fullscreen, .exit-fs").toggle();
    $("#drawer").hide("fade", 100);
  });
  
  /* Log out */
  $(".logout").click(function() {
    $(".login, .environment").fadeToggle(100);
    $(".login-password").focus();
    $("#drawer").hide("fade", 100);
  });
  
  /* Power off */
  $(".shutdown").click(function() {
    $("body").fadeOut(200).delay(2000).fadeIn(200);
    $("#drawer").hide("fade", 100);
  });
  
  /* Time */
  var t;
  
  function checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  function startTime() {
    var today = new Date();
    var n = today.toLocaleString('default', {
      month: 'long'
    });
    var d = today.getDate();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();

    m = checkTime(m);
    s = checkTime(s);
    up += 1;

    $("#time").text(n + " " + d + " " + h + ":" + m);
    $(".login-time").text(n + " " + d + " " + h + ":" + m);
    t = setTimeout(function() {
      startTime()
    }, 1000);
  }
  startTime();
});