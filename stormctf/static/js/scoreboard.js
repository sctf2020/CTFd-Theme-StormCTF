function updatescores () {
  $.get(script_root + '/scores', function( data ) {
    var teams = $.parseJSON(JSON.stringify(data));
    var table = $('#scoreboard tbody');
    table.empty();
    for (var i = 0; i < teams['standings'].length; i++) {
        var row="<tr>\n" +
            "<td class=\"uk-text-center\">{0}</td>".format(i + 1) +
            "<td class=\"uk-text-center\"><a href=\"{0}/team/{1}\">{2}</a></td>".format(script_root, teams['standings'][i].id, htmlentities(teams['standings'][i].team)) +
            "<td class=\"uk-text-center\">{0}</td>".format(teams['standings'][i].score) +
            "</tr>";
        table.append(row);
    }
  });
}

function cumulativesum (arr) {
    var result = arr.concat();
    for (var i = 0; i < arr.length; i++){
        result[i] = arr.slice(0, i + 1).reduce(function(p, i){ return p + i; });
    }
    return result
}

function UTCtoDate(utc){
    var d = new Date(0);
    d.setUTCSeconds(utc);
    return d;
}

function scoregraph () {
    $.get(script_root + '/top/5', function( data ) {
        var places = $.parseJSON(JSON.stringify(data));
        places = places['places'];
        if (Object.keys(places).length === 0 ){
            // Replace spinner
            $('#score-graph').html(
                '<div class="uk-text-center"><h2>No solves yet</h2></div>'
            );
            return;
        }

        var teams = Object.keys(places);
        var traces = [];
        for(var i = 0; i < teams.length; i++){
            var team_score = [];
            var times = [];
            for(var j = 0; j < places[teams[i]]['solves'].length; j++){
                team_score.push(places[teams[i]]['solves'][j].value);
                var date = moment(places[teams[i]]['solves'][j].time * 1000);
                times.push(date.toDate());
            }
            team_score = cumulativesum(team_score);
            var trace = {
                x: times,
                y: team_score,
                mode: 'lines+markers',
                name: places[teams[i]]['name'],
                marker: {
                    color: colorhash(places[teams[i]]['name'] + places[teams[i]]['id']),
                },
                line: {
                    color: colorhash(places[teams[i]]['name'] + places[teams[i]]['id']),
                }
            };
            traces.push(trace);
        }

        traces.sort(function(a, b) {
            var scorediff = b['y'][b['y'].length - 1] - a['y'][a['y'].length - 1];
            if(!scorediff) {
                return a['x'][a['x'].length - 1] - b['x'][b['x'].length - 1];
            }
            return scorediff;
        });

        var layout = {
            title: 'Top 5 Teams',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            hovermode: 'closest',
            titlefont: {
                family: 'Raleway',
                size: '36',
                color: 'white'
            },
            xaxis: {
                showgrid: false,
                showspikes: true,
                color: 'white',
            },
            yaxis: {
                showgrid: false,
                showspikes: true,
                color: 'white',
            },
            legend: {
                orientation: "h",
                family: 'Raleway',
                font: {
                    color: "white",
                    size: "14"
                }
            },
            marker: {
                symbol: "diamond-dot"
            },
            hoverlabel: {
                bgcolor: "black",
                font: {
                    family: "Raleway",
                    size: "20"
                }
            }
        };
        console.log(traces);

        $('#score-graph').empty(); // Remove spinners
        Plotly.newPlot('score-graph', traces, layout, {
             //displayModeBar: false,

            displaylogo: false
        });
    });
}

function update(){
  updatescores();
  scoregraph();
}

setInterval(update, 300000); // Update scores every 5 minutes
scoregraph();

window.onresize = function () {
    Plotly.Plots.resize(document.getElementById('score-graph'));
};
