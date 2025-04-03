var up = 0;

$(document).ready(function() {
  $("#intro").show("fade", 100);
  
  $(function() {
    $(".window").draggable({
      containment: "#body"
    });
    $(".window").resizable({
      resize: function() {
        var w = $(this).width();
        var h = $(this).height();
        
        $(".res").finish().fadeIn(0).delay(500).fadeOut('slow');
        $("#res-val").text(w + ", " + h);
      }
    });
  });
  
  /* Focus window */
  $(".window").click(function() {
    $(".window").not(this).css("z-index", "1");
    $(this).css("z-index", "2");
  })
  
  /* Open window */
  $(function() {
    $(".open-app").click(function() {
      var app = $(this).attr('value');
      
      $(app).show("fade", 100);
      $("#drawer").hide("fade", 100);
    });
  });
  
  /* Close window */
  $(function() {
    $(".close-app").click(function() {
      var app = $(this).attr('value');
      
      $(app).hide("fade", 100);
    });
  });
  
  /* Run app */
  $(function() {
    $(".run-app").keypress(function (e) {
      var key = e.which;
      
      if (key == 13) {
        var app = "#" + $(".run-app").val();
        
        $(app).show("fade", 100);
        $("#run").hide("fade", 100);
        $(".run-app").val("");
      }
    });
  });
  
  /* Focus terminal prompt */
  $(function() {
    $("#term").click(function() {
      $("#prompt").focus();
    });
  });
  
  /* Append command */
  $("#prompt").keypress(function (e) {
    var key = e.which;
    
    if (key == 13) {
      $("#buffer").append("<li><span><span style='color: #1aec0f;''>user@coffeeos</span>:~$ </span>" + $("#prompt").val() + "</li>");
      if ($("#prompt").val() == "sudo rm -rf /") {
        $("#buffer").append("<li>user is not in the sudoers file. This incident will be reported.</li>");
      }
      else if ($("#prompt").val() == "neofetch") {
        $("#buffer").append("<li><pre>          c   c  c      <span style='color: #fce94f;'>user</span>@<span style='color: #fce94f;'>coffeeos</span></pre></li>");
        $("#buffer").append("<li><pre>          K;  K; K;     -----------------------</pre></li>");
        $("#buffer").append("<li><pre>          :0  :0 :0     <span style='color: #fce94f;'>OS</span>: CoffeeOS 22.04-b20220511</pre></li>");
        $("#buffer").append("<li><pre>           k   k  k     <span style='color: #fce94f;'>Kernel</span>: 1.00</pre></li>");
        $("#buffer").append("<li><pre>           '   '  '     <span style='color: #fce94f;'>Uptime</span>: " + Math.round(up / 60) + " mins</pre></li>");
        $("#buffer").append("<li><pre>      .''''d''d''d'''   <span style='color: #fce94f;'>Packages</span>: 100</pre></li>");
        $("#buffer").append("<li><pre>     KXXXXXXXXXXXXXXK   <span style='color: #fce94f;'>Resolution</span>: " + $(window).width() + "x" + $(window).height() + "</pre></li>");
        $("#buffer").append("<li><pre>    dXd KXXXXXXXXXXXK   <span style='color: #fce94f;'>Shell</span>: csh 0.9</pre></li>");
        $("#buffer").append("<li><pre>    KX  0XXXXXXXXXXXK   <span style='color: #fce94f;'>Terminal</span>: term</pre></li>");
        $("#buffer").append("<li><pre>    KX  0XXXXXXXXXXX0   <span style='color: #fce94f;'>Theme</span>: Caffeine</pre></li>");
        $("#buffer").append("<li><pre>    .KXdXXXXXXXXXXXXd   <span style='color: #fce94f;'>Icons</span>: Papirus</pre></li>");
        $("#buffer").append("<li><pre>      dKKXXXXXXXXXXXX;   ");
        $("#buffer").append("<li><pre>         OXXXXXXXXXO    ");
        $("#buffer").append("<li><pre>          ckKKKXKkc     ");
      }
      else if ($("#prompt").val() == "clear") {
        $("#buffer").empty();
      }
      else if ($("#prompt").val().charAt(0) == ".") {
        var app = "#" + $("#prompt").val().substr(1);
        $(app).show("fade", 100);
      }
      else {
        $("#buffer").append($("#prompt").val() + ": command not found");
      }
      
      $("#prompt").val("");
      return false;
    }
  });

  /* App Drawer */
  $(function() {
    $("#open-drawer").click(function() {
      $("#wifi").hide();
      $("#sound").hide();
      $("#drawer").toggle("fade", 100);
    });
  });
  
  /* Wi-Fi */
  $(function() {
    $("#open-wifi").click(function() {
      $("#drawer").hide();
      $("#sound").hide();
      $("#wifi").toggle("fade", 100);
    });
  });
  
  /* Sound */
  $(function() {
    $("#open-sound").click(function() {
      $("#drawer").hide();
      $("#wifi").hide();
      $("#sound").toggle("fade", 100);
    });
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
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    var g = document.getElementById('greeting');

    m = checkTime(m);
    s = checkTime(s);
    up += 1;

    document.getElementById('time').innerHTML = h + ":" + m;
    t = setTimeout(function() { startTime() }, 1000);
  }
  startTime();
  
  /* Change background */
  $(function() {
    $(".change-bg").click(function() {
      $("body").css("backgroundImage", "url('" + $(".bg-url").val() + "')");
      $("body").css("backgroundSize", $(".bg-type").val());
    });
  });
});

/* Calculator */
function calcDis(val) {
  document.getElementById("result").value += val;
}

function calcSolve() {
  let x = document.getElementById("result").value;
  let y = eval(x);
  document.getElementById("result").value = y;
}

function calcClear() {
  document.getElementById("result").value = "";
}