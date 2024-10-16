/*****************************************************************************
 * FILE:                sites.js
 * BEGGINING DATE:      16 August 2019
 * ENDING DATE:         ---------------
 * AUTHOR:              Giovanni Romero Bustamante
 * COPYRIGHT:           (c) Brigham Young University 2020
 * LICENSE:             MIT
 *
 *****************************************************************************/

/**
 * Function activate_layer_values:
 * retrieves the data from the layers when one makes a click
 * @return {void} A good string
 *
 */
activate_layer_values = function () {
  try {
    map.on('singleclick', function(evt) {
      // $('#variables_graph').selectpicker('setStyle', 'btn-primary');
      $('#variables_graph').select2();
      evt.stopPropagation();
      $("#graphs").empty();
      let object_request={};

      // Cluster zooming when clicked on
      var coordinate = evt.coordinate;
      var features = map.getFeaturesAtPixel(evt.pixel);
      if(features) {
        var isCluster = features.some(function(feature) {
          return feature.get('features') instanceof Array && feature.get('features').length > 1;        });
        }
        if (isCluster) {
          var clusterFeature = features.find(function(feature) {
            return feature.get("features") instanceof Array && feature.get('features').length > 1;
          });

          var individualFeatures = clusterFeature.get('features');

            // Calculate the extent of the individual features
            var extent = ol.extent.createEmpty();
            individualFeatures.forEach(function(feature) {
                ol.extent.extend(extent, feature.getGeometry().getExtent());
            });

            // Zoom to the extent of the individual features
            map.getView().fit(extent, { padding: [100, 100, 100, 100] });
         
        


       } else {
      // MAKE THE POINT LAYER FOR THE MAP //
      var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature2, layer) {
          if(feature2){
            if(layersDict['selectedPointModal']){
              map.removeLayer(layersDict['selectedPointModal'])
              map.updateSize()
            }

            if(layersDict['selectedPoint']){
              map.removeLayer(layersDict['selectedPoint'])
              map.updateSize()
            }

            let actual_Source = new ol.source.Vector({})
            actual_Source.addFeature(feature2);
            let vectorLayer = new ol.layer.Vector({
                source: actual_Source,
                style:  new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 6,
                        stroke: new ol.style.Stroke({
                            color: "black",
                            width: 4
                        }),
                        fill: new ol.style.Fill({
                            color: `#FF0000`
                        })
                    })
                })
            })
            layersDict['selectedPoint'] = vectorLayer;

            map.addLayer(vectorLayer);
          }
          return feature2;
      });
      // IF THE FEATURE EXTITS THEN DO THE FOLLOWING//

      if (feature) {
        initialize_graphs([],[],"No Variable was Selected","","","","scatter");
        active_map_feature_graphs={
          'scatter':{},
          'bar':{},
          'pie':{},
          'whisker':{}
        }
        let feature_single = feature.getProperties().features[0].getProperties()
        
        current_station_name = feature_single['name'];
        object_request['hs_url']=feature_single['hs_url'];
        object_request['code']=feature_single['code'];
        object_request['network']=feature_single['network'];
        object_request["server_type"] = feature_single["server_type"];

        $("#GeneralLoading").removeClass("hidden");
        $('#sG').bootstrapToggle('on');
        $.ajax({
          type:"POST",
          url: `get-values-hs/`,
          dataType: "JSON",
          data: object_request,
          success: function(result){
            try{
              // Clear out the metadata table in modal
              $("#table_div").empty();
              $("#variables_graph").empty();
              // MAKE THE METADATA OF THE SITE TO LOAD IN THE FIRST SLIDE //
              let description_site = document.getElementById('siteDes');
              $("#datetimepicker6").datepicker("setDate", null);
              $("#datetimepicker7").datepicker("setDate", null);

              if (feature_single["server_type"] == "hydroserver1") {
                $("#update_graphs").attr("server-type","hydroserver1");
              
                $('#download_dropdown').empty(); // Remove all download options to clear it out
                $("#download_dropdown").append('<option value="Download">Download</option>');
                $("#download_dropdown").append('<option value="CSV" >CSV</option>');
                $("#download_dropdown").append('<option value = "WaterML1.0">WaterML 1.0</option>');
                $("#download_dropdown").append('<option value = "WaterML2.0">WaterML 2.0</option>');
                $("#download_dropdown").append('<option value = "NetCDF">NetCDF</option>');

                if (result.hasOwnProperty('codes') && result['codes'].length > 0){
                  let geolocations = result['geolo'];
                  let country_name = result['country'];
                  if(country_name == null){
                    country_name = "No Data Provided"
                  }
                  let lats = parseFloat(geolocations['latitude']);
                  if(lats == null){
                    lats = "No Data Provided"
                  }
                  let lons = parseFloat(geolocations['longitude']);
                  if(lons == null){
                    lons = "No Data Provided"
                  }
                  let new_lat = "No Data Provided"
                  let new_lon = "No Data Provided"
                  if(lats != null && lons != null ){
                    new_lat = toDegreesMinutesAndSeconds(lats);
                    new_lon = toDegreesMinutesAndSeconds(lons);
                  }
  
  
                  let organization_name = result['organization'][Object.keys(result['organization'])[0]];
                  if(organization_name == null){
                    organization_name = "No Data Provided";
                  }
  
                  description_site.innerHTML =
                    ` <p> <span>Station/Platform Name: </span> ${feature_single['name']}<p>
                      <p> <span> Territory of origin of data:</span> ${country_name}<p>
                      <p> <span> Supervising Organization:</span> ${organization_name} <p>
                      <p> <span> Geospatial Location:</span> lat: ${new_lat} lon: ${new_lon} <p>`
  
                  // MAKE THE TABLE METADATA OF THE SITE TO LOAD IN THE FIRST SLIDE //
                  let table_begin =
                    `<br>
                    <p><i>Table of Variables</i></p>
                    <table id="siteVariableTable" class="table table-striped table-hover table-condensed">
                        <tr class="danger">
                          <th>Observed Variables</th>
                          <th>Unit</th>
                        </tr>`;
  
                  //SORT THERESULT FROM THE AJAX RESPONSE FOR SOME ATTRIBUTES //
  
                  //1) combine the arrays:
                   var list_e = [];
                   for (var j = 0; j <result['variables'].length; j++)
                       list_e.push({'variables_name': result['variables'][j], 'units': result['units'][j],'interpolation': result['dataType'][j] ,'timeSupport':result['timeSupport'][j],'timeUnits':result['timeUnitName'][j],'codes':result['codes'][j]});
  
                   //2) sort:
                   list_e.sort(function(a, b) {
                       return ((a.variables_name < b.variables_name) ? -1 : ((a.variables_name == b.variables_name) ? 0 : 1));
  
                   });
                   //3) separate them back out:
                   let parsed_table = {
                     variables:[],
                     units:[],
                     dataType:[],
                     timeUnitName:[],
                     timeSupport:[],
                     codes:[]
                   };
  
                   for (var k = 0; k < list_e.length; k++) {
                       parsed_table['variables'].push(list_e[k].variables_name);
                       parsed_table['units'].push(list_e[k].units);
                       parsed_table['dataType'].push(list_e[k].interpolation);
                       parsed_table['timeUnitName'].push(list_e[k].timeUnits);
                       parsed_table['timeSupport'].push(list_e[k].timeSupport);
                       parsed_table['codes'].push(list_e[k].codes);
                   }
  
                  //WRITTING TO TABLE IN THE SLIDE //
  
                  for(let i=0; i<parsed_table['variables'].length ; ++i){
                    let variable_new = parsed_table['variables'][i];
                    let variable_code_new = parsed_table['codes'][i];
                    if(variable_new == null){
                      variable_new = "No Data Provided"
                    }
                    let variable_unit = parsed_table['units'][i];
                    if(variable_unit == null){
                      variable_unit = "No Data Provided"
                    }
                    let aggregation_dur = `${parsed_table['timeSupport'][i]} ${parsed_table['timeUnitName'][i]}`;
                    if(aggregation_dur == null){
                      aggregation_dur = "No Data Provided"
                    }
                    let time_serie_range = result['times_series'][variable_code_new];
  
                    let begin_date = time_serie_range['beginDateTime'].split('T')[0];
                    if(begin_date == null){
                      begin_date = "No Data Provided"
                    }
                    let end_date = time_serie_range['endDateTime'].split('T')[0];
                    if(end_date == null){
                      end_date = "No Data Provided"
                    }
                    let interpolation_type = result['dataType'][i];
                    if(interpolation_type == null){
                      interpolation_type = "No Data Provided"
                    }
                    let newRow =
                    `
                    <tr>
                      <th>${variable_new}</th>
                      <th>${variable_unit}</th>
                    </tr>
                    `
                    table_begin = table_begin + newRow;
                  }
  
                  table_begin = table_begin + `</table>`;
                  $("#table_div").html(table_begin);
  
                  //  MAKE THE SECOND SLIDE TO MAKE THE DROPDOWN MENU AND ALSO DATES//
                  // 1 empty the dropdown for variables//
                  evt.stopPropagation();
                  $("#variables_graph").empty();
                  //$("#variables_graph").selectpicker("refresh");
                  $("#variables_graph").select2();
  
                  // 2 make the dropdown with the variables //
                  let variables = result['variables'];
                  let code_variable =result['codes'];
                  let variable_select = $("#variables_graph");
                  let i = 1;
                  let array_variables=[]
                  let option_variables;
                  let option_beginning= `<option value= 0 selected= "selected" > Select Variable </option>`;
                  variable_select.append(option_beginning)
  
                  variables.forEach(function(variable){
                    let option;
                    let option_begin;
                      array_variables.push(variable);
                      if(i === 1){
  
                        option_begin = `<option value=${i} variable-code="${code_variable[i-1]}">${variable} </option>`;
                        variable_select.append(option_begin)
                      }
                      else{
                        option = `<option value=${i} variable-code="${code_variable[i-1]}">${variable} </option>`;
  
                      }
                      variable_select.append(option)
  
                      variable_select.select2();
                      i = i+1;
                  });
  
                  //3. Bind the events to the dropdown //
                  $("#variables_graph").unbind('change');
  
                  $('#variables_graph').bind('change', function(e){
                    try{                                                      
                      variable_select.select2();
                      var selectedItem = $('#variables_graph').val() -1;
                      var selectedItemText = $('#variables_graph option:selected').text();
                      $("#GeneralLoading").removeClass("hidden");
                      let object_request2 = {};
                      object_request2['hs_name']=feature_single['hs_name'];
                      object_request2['site_name']=feature_single['name'];
                      object_request2['hs_url']=feature_single['hs_url'];
                      object_request2['code']=feature_single['code'];
                      object_request2['network']=feature_single['network'];
                      object_request2['variable']=selectedItem;
                      object_request2['code_variable']= code_variable[`${selectedItem}`];
                      object_request2['times_series'] = result['times_series'];                      
                      time_series_cache = result['times_series'];
                      object_request2['variables_array']=result['variables'];
                      object_request_graphs = JSON.parse(JSON.stringify(object_request2));
  
                      let start_dateUTC = result['times_series'][Object.keys(result['times_series'])[selectedItem]]['beginDateTimeUTC']
                      let dateUTC_start = new Date(start_dateUTC)
                      let starts = start_dateUTC.split("T");
                      let starts_no_seconds = starts[1].split(":");
                      let end_dateUTC = result['times_series'][Object.keys(result['times_series'])[selectedItem]]['endDateTimeUTC']
                      let dateUTC_end = new Date(end_dateUTC)
  
                      let ends = end_dateUTC.split("T");
  
                      let ends_no_seconds = ends[1].split(":");
  
                      // // THIS IS NECESARRY TO RESET THE DATES OTHERWISE IT IS GOING TO HAVE EMPTY SPACES..
                      $('#datetimepicker6').datepicker('setStartDate', null);
                      $('#datetimepicker6').datepicker('setEndDate', null);
                      $('#datetimepicker7').datepicker('setEndDate',null);
  
                      //@KrunchMuffin I found a workaround this issue:
                      //Before setting the value remove the limitation (endDate)
                      // Set the value
                      //Restore the limitation (endDate)
                      //
                      // Maybe it will work for you also
                      // https://github.com/uxsolutions/bootstrap-datepicker/issues/2292#issuecomment-341496634
  
                      $('#datetimepicker6').datepicker('update', dateUTC_start);
                      $('#datetimepicker7').datepicker('update', dateUTC_end);
                      $('#datetimepicker6').datepicker('setStartDate', dateUTC_start);
                      $('#datetimepicker6').datepicker('setEndDate', dateUTC_end);
                      // $('#datetimepicker7').datepicker('setStartDate',dateUTC_end);
                      $('#datetimepicker7').datepicker('setEndDate',dateUTC_end);
                      $("#GeneralLoading").addClass("hidden");


                      
  
                    }
                    catch(e){
                      console.log(e);
                      $("#GeneralLoading").addClass("hidden");
                    }
  
                  });
  
                   $("#GeneralLoading").addClass("hidden");
                   $("#siteName_title").empty();
  
                }
                else{
                  description_site.innerHTML =
                    ` <p> <em> Station/Platform Name:</em> ${feature_single['name']}<p>`
                  

                  $("#GeneralLoading").addClass("hidden");
                  new Notify ({
                    status: 'warning',
                    title: 'Warning',
                    text: `The ${feature_single['name']} site does not contain any variables`,
                    effect: 'fade',
                    speed: 300,
                    customClass: '',
                    customIcon: '',
                    showIcon: true,
                    showCloseButton: true,
                    autoclose: true,
                    autotimeout: 3000,
                    gap: 20,
                    distance: 20,
                    type: 1,
                    position: 'right top'
                  })
                  // $.notify(
                  //     {
                  //         message: `The ${feature_single['name']} site does not contain any variable`
                  //     },
                  //     {
                  //         type: "info",
                  //         allow_dismiss: true,
                  //         z_index: 20000,
                  //         delay: 5000,
                  //         animate: {
                  //           enter: 'animated fadeInRight',
                  //           exit: 'animated fadeOutRight'
                  //         },
                  //         onShow: function() {
                  //             this.css({'width':'auto','height':'auto'});
                  //         }
                  //     }
                  // )
                }
              } else { //Hydroserver 2
                
                $("#update_graphs").attr("server-type","hydroserver2");
                $('#download_dropdown').empty(); // Remove all download options to clear it out
                $("#download_dropdown").append('<option value="Download">Download</option>');
                $("#download_dropdown").append('<option value="CSV" >CSV</option>');
                let country = result["country"];
                let organization = result["organization"];
                let lat = feature_single["lat"];
                let lon = feature_single["lon"];
                

                if (country == null) {
                  country = "No Data Provided";
                }

                if (organization == null) {
                  organization = "No Data Provided";
                }

                description_site.innerHTML =
                    ` <p> <span>Station/Platform Name: </span> ${feature_single['name']}<p>
                      <p> <span> Territory of origin of data:</span> ${country}<p>
                      <p> <span> Supervising Organization:</span> ${organization} <p>
                      <p> <span> Geospatial Location:</span> lat: ${lat} lon: ${lon} <p>`
  
                if (result["datastreams"].length > 0) {
                  let table_begin =
                    `<br>
                    <p><i>Table of Variables</i></p>
                    <table id="siteVariableTable" class="table table-striped table-hover table-condensed">
                        <tr class="danger">
                          <th>Observed Variables</th>
                          <th>Unit</th>
                        </tr>`;
                  result["datastreams"].forEach(function(datastream) {
                    
                    var variableName = datastream["observed_property_name"];
                    var unitName = datastream["unit_name"];
                    var interpolationType = "No interpolation found";

                    var variableId = datastream["observed_property_id"];

                    let newRow = `<tr>
                                    <th>${variableName}</th>
                                    <th>${unitName}</th>
                                  </tr>`;

                    table_begin += newRow;

                    $("variables_graph").empty();
                    $("#variables_graph").select2();
                    
                  });

                  let variable_select = $("#variables_graph");
                    // // Access the element by its ID
                    // var carousel = document.getElementById('carouselExampleIndicators');

                    // // Check if the element exists to avoid errors
                    // if (carousel) {
                    //   // Set overflow properties to "auto" or another value as needed
                    //   carousel.style.overflowY = "";
                    //   carousel.style.overflowX = "";
                  // }

                  variable_select.empty();
                  let option_beginning= `<option value= 0 selected= "selected" > Select Variable </option>`;
                  variable_select.append(option_beginning);
                  result["datastreams"].forEach(function(datastream) {
                    let variableName = datastream["observed_property_name"];
                    let datastreamId = datastream["datastream_id"];
                    //may need to add unit_id here for API calls upon graph button being pressed
                    
                    let option;
                    option = `<option datastream_id="${datastreamId}" variable-code="${datastream["observed_property_code"]}">${variableName}</option>`;
                    variable_select.append(option);
                  });
                  

                  table_begin += "</table>";
                  $("#table_div").html(table_begin);
                  
                  $("#variables_graph").unbind('change',function(e){
                    // var carousel = document.getElementById('carouselExampleIndicators');

                    // // Check if the element exists to avoid errors
                    // if (carousel) {
                    //   // Set overflow properties to "auto" or another value as needed
                    //   carousel.style.overflowY = "scroll";
                    //   carousel.style.overflowX = "scroll";
                    // }
                  });
                  $("#variables_graph").bind('change', function(e) {
                    variable_select.select2();
                    var selectedDatastreamId = $("#variables_graph");
                    var object_request = {"url": feature_single["hs_url"],
                                          "datastream_id": $("#variables_graph option:selected").attr("datastream_id")};
                    
                    // var carousel = document.getElementById('carouselExampleIndicators');

                    // // Check if the element exists to avoid errors
                    // if (carousel) {
                    //   // Set overflow properties to "auto" or another value as needed
                    //   carousel.style.overflowY = "visible";
                    //   carousel.style.overflowX = "visible";
                    // }
                    
                    $.ajax({
                      type:"POST",
                      url: `get-datastream-values/`,
                      dataType: "JSON",
                      data: object_request,
                      success: function(result) {
                        if (result["observed_values"].length == 0) {
                          new Notify ({
                            status: 'warning',
                            title: 'Warning',
                            text: `No time series data was found for ${$("#variables_graph option: selected")}`,
                            effect: 'fade',
                            speed: 300,
                            customClass: '',
                            customIcon: '',
                            showIcon: true,
                            showCloseButton: true,
                            autoclose: true,
                            autotimeout: 3000,
                            gap: 20,
                            distance: 20,
                            type: 1,
                            position: 'right top'
                          })
                        } else {

                        // THIS IS NECESARRY TO RESET THE DATES OTHERWISE IT IS GOING TO HAVE EMPTY SPACES..
                        $('#datetimepicker6').datepicker('setStartDate', null);
                        $('#datetimepicker6').datepicker('setEndDate', null);
                        $('#datetimepicker7').datepicker('setEndDate',null);

                        let startDate = result["minimum_time"];
                        let endDate = result["maximum_time"];
                        
                        $("#datetimepicker6").datepicker('update', startDate);
                        $("#datetimepicker7").datepicker('update',endDate);

                        $("#datetimepicker6").datepicker("setStartDate", startDate);
                        $("#datetimepicker6").datepicker("setEndDate", endDate);
                        $("#datetimepicker7").datepicker("setEndDate", endDate);
                        $("#hydroserver-2-values-input").val("");
                        $("#hydroserver-2-values-input").val(JSON.stringify(result));
                      }
                    }
                    })
                  })
                
                } else {
                  // No variables found
                  $("#table_div").html(`<p> This site does not have any variables </p>`);
                  new Notify ({
                    status: 'warning',
                    title: 'Warning',
                    text: `The ${feature_single['name']} site does not contain any variables`,
                    effect: 'fade',
                    speed: 300,
                    customClass: '',
                    customIcon: '',
                    showIcon: true,
                    showCloseButton: true,
                    autoclose: true,
                    autotimeout: 3000,
                    gap: 20,
                    distance: 20,
                    type: 1,
                    position: 'right top'
                  })
                }
                
                $("#GeneralLoading").addClass("hidden");

              }
              
            }
            catch(e){
              $("#GeneralLoading").addClass("hidden");
              console.log(e);
              new Notify ({
                status: 'error',
                title: 'Error',
                text: `There was an issue retrieving the complete data of the station/platform`,
                effect: 'fade',
                speed: 300,
                customClass: '',
                customIcon: '',
                showIcon: true,
                showCloseButton: true,
                autoclose: true,
                autotimeout: 3000,
                gap: 20,
                distance: 20,
                type: 1,
                position: 'right top'
              })
              // $.notify(
              //     {
              //         message: `The is an error retriving the complete data of the station/platform `
              //     },
              //     {
              //         type: "danger",
              //         allow_dismiss: true,
              //         z_index: 20000,
              //         delay: 5000,
              //         animate: {
              //           enter: 'animated fadeInRight',
              //           exit: 'animated fadeOutRight'
              //         },
              //         onShow: function() {
              //             this.css({'width':'auto','height':'auto'});
              //         }
              //     }
              // )
            }



          },
          error: function(xhr, status, error){
            $("#GeneralLoading").addClass("hidden");
            new Notify ({
              status: 'error',
              title: 'Error',
              text: `There was an issue retrieving the values for the ${feature_single['name']} site`,
              effect: 'fade',
              speed: 300,
              customClass: '',
              customIcon: '',
              showIcon: true,
              showCloseButton: true,
              autoclose: true,
              autotimeout: 3000,
              gap: 20,
              distance: 20,
              type: 1,
              position: 'right top'
            })
            // $.notify(
            //     {
            //         message: `There is an error to retrieve the values for the ${feature_single['name']} site `
            //     },
            //     {
            //         type: "danger",
            //         allow_dismiss: true,
            //         z_index: 20000,
            //         delay: 5000,
            //         animate: {
            //           enter: 'animated fadeInRight',
            //           exit: 'animated fadeOutRight'
            //         },
            //         onShow: function() {
            //             this.css({'width':'auto','height':'auto'});
            //         }
            //     }
            // )
          }

        })

      }
    }
      
    });
    
  }
  catch(error){
    $("#GeneralLoading").addClass("hidden");
    new Notify ({
      status: 'warning',
      title: 'Warning',
      text: `Unable to retrieve information for the selected site`,
      effect: 'fade',
      speed: 300,
      customClass: '',
      customIcon: '',
      showIcon: true,
      showCloseButton: true,
      autoclose: true,
      autotimeout: 3000,
      gap: 20,
      distance: 20,
      type: 1,
      position: 'right top'
    })
    // $.notify(
    //     {
    //         message: `Unable to retrieve information of the selected site`
    //     },
    //     {
    //         type: "info",
    //         allow_dismiss: true,
    //         z_index: 20000,
    //         delay: 5000,
    //         animate: {
    //           enter: 'animated fadeInRight',
    //           exit: 'animated fadeOutRight'
    //         },
    //         onShow: function() {
    //             this.css({'width':'auto','height':'auto'});
    //         }
    //     }
    // )
  }

}
