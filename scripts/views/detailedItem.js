define(
[
    'text!templates/leadDetails.html',
    'collections/dealers',
    'views/search',
    'views/helpers/util',
    'config'
],

function(template,DealersCollection, SearchView, helpers, Config) {

    // that view handle detail view
    var DetailedItemView = Backbone.View.extend({

        el : "#wrap-content",

        template: _.template(template),

        events : {
            "click a.back"                                      : "backToList",
            "click .only-cust.toolbar-cust a.refuse"            : "displayRefuseLeadPopup",
            "click #refuseLeadPopup a.action"                   : "refuseLead",
            "click #refuseLeadPopup .closePanel a"              : "displayRefuseLeadPopup",
            "click .only-cust.toolbar-cust a.accept"            : "acceptLead",
            "click .only-cust.toolbar-cust a.close"             : "displayCloseLeadPopup",
            "click .details_plus a.close"                        : "displayCloseLeadPopup",
            "click #closeLeadPopup a.action"                    : "closeLead",
            "click #closeLeadPopup .closePanel a"               : "displayCloseLeadPopup",
            "click .only-srep.toolbar-srep.list a.assign"       : "displayAssignLeadList",
            "click .only-srep.toolbar-srep.assign a.assign"     : "assignLead",
            "click .only-srep.toolbar-srep a.backtodetail"      : "backToDetail",
            "click .project-dealers .ui-block-a"                : "selectLead",
            "click .add-comment"                                : "displayCommentLead",
            "click #commentLeadPopup a.comment"                 : "commentLead",
            "click #commentLeadPopup .closePanel a"             : "displayCommentLead",
            "click .details_plus a.commentSalesRep"             : "displayCommentLead"
        },

        initialize: function() {
            _.bindAll(this, "render");
            this.model.on('change', this.update, this);
            document.addEventListener("online", this.render, false);
            document.addEventListener("offline", this.render, false);
        },

        update : function () {
            $(this.el).find("#item-detail").remove();
            this.render();
        },

        destroyView : function () {
            //COMPLETELY UNBIND THE VIEW
            this.undelegateEvents();

            $("#item-detail").removeData().unbind();
        },

        render: function() {
            if (currentView !== "details") return;

            var online = App.isOnline();
            var $el = $(this.el);
            var data = this.model.toJSON();
            _.extend(data, helpers);

            $('#item-detail').remove();

            $el.prepend(this.template(data));

            // if lead is not accepted: display "accept button"
            if (this.model.get("leads")[0].status_id == 2) {
                this.$(".only-cust.toolbar-cust.assigned").remove();
            } else {
                if(this.model.get("leads")[0].status_id == 4){
                    this.$(".only-cust.toolbar-cust .close").remove();
                }
                // else display close and send back to somfy button
                this.$(".only-cust.toolbar-cust.unassigned").remove();
                this.$(".only-cust.toolbar-cust.accepted").removeClass("hidden");
                this.showEndUser();
            }

            if (!online) {
                // disable buttons
                $('a.refuse', this.$el).addClass('ui-disabled');
                $('a.accept', this.$el).addClass('ui-disabled');
                $('a.close', this.$el).addClass('ui-disabled');
                $('a.assign', this.$el).addClass('ui-disabled');
                $('a.add-comment', this.$el).addClass('ui-disabled');
                $('a.commentSalesRep', this.$el).addClass('ui-disabled');
            } else {
                $('a.refuse', this.$el).removeClass('ui-disabled');
                $('a.accept', this.$el).removeClass('ui-disabled');
                $('a.close', this.$el).removeClass('ui-disabled');
                $('a.assign', this.$el).removeClass('ui-disabled');
                $('a.add-comment', this.$el).removeClass('ui-disabled');
                $('a.commentSalesRep', this.$el).removeClass('ui-disabled');
            }

            $("#item-detail").trigger('create');
            initView();

            $('html body').animate({scrollTop: 0});
              
            return this;
        },

        /* *** ACTIONS *** */
        acceptLead : function (ev) {
            ev.preventDefault();

            if (!App.isOnline()) return;

            console.log ("Try to accept that lead");
            
            var me = this;
                
            var data = {
                method:     "UpdateLead",
                crmid:      globalUser.get('USER').crmid,
                language:   globalUser.get('LANGUAGE'),
                token:      globalUser.get('TOKEN'),
                leadId:     me.model.get("leads")[0].lead_id,
                leadStatus: "97"
            };

            // mark leads as accepted
            $.ajax({url: Config.baseURL, data:data,
                success: function (data) {
                    var dataObj = jQuery.parseJSON(data)
                    if (dataObj.SUCCESS) {
                        me.model.set({
                            ws_qs : '&crmid='+globalUser.get('USER').crmid+'&siteid='+globalUser.get("SITEID")+'&language='+globalUser.get('LANGUAGE')+'&token='+globalUser.get('TOKEN')+'&projectid='+me.model.get("project_id")
                        });
                        me.model.fetch({
                            success: function () {
                                me.update();
                                me.showEndUser();
                            }
                        });
                        // Decrement app badge
                        if (!globalUser.isSalesRep() && window.plugins && window.plugins.pushNotification) {
                            pn = window.plugins.pushNotification;
                            pn.getApplicationIconBadgeNumber(function(num) { 
                                if (num > 0) pn.setApplicationIconBadgeNumber(num - 1);
                            });
                        }
                    }
                    else {
                        alert(dataObj.MESSAGE);
                    }
                },
                error: function () {
                    console.log("Error while updating lead status. Please contact an administrator.");
                }
            });
         },

        refuseLead : function (ev) {

            if (!App.isOnline()) return;

            console.log ("Try to refused that lead");

            var me = this;
            
            // close popup
            this.displayCloseLeadPopup();

            // query webservice
            var idReason = $(ev.currentTarget).attr("data-id");

            var data = {
                method:     "UpdateLead",
                crmid:      globalUser.get('USER').crmid,
                language:   globalUser.get('LANGUAGE'),
                token:      globalUser.get('TOKEN'),
                leadId:     me.model.get("leads")[0].lead_id,
                leadStatus: 99,
                statusData: idReason
            };

            $.ajax({url:Config.baseURL, data:data,
                success : function (data) {
                    var dataObj = jQuery.parseJSON(data);
                    if (dataObj.SUCCESS) {
                       me.updateModel(me.backToList);

                       // Decrement app badge
                       if (!globalUser.isSalesRep() && window.plugins && window.plugins.pushNotification) {
                            pn = window.plugins.pushNotification;
                            pn.getApplicationIconBadgeNumber(function(num) { 
                                if (num > 0) pn.setApplicationIconBadgeNumber(num - 1); 
                            });
                        }
                    }
                    else {
                        alert(dataObj.MESSAGE);
                    }
                }, 
                error : function () {
                    alert("Unable to refuse this lead due to unknown error.");
                }
            });
        },

        commentLead : function (ev) {
            ev.preventDefault();

            if (!App.isOnline()) return;

            var me = this;
            var lId = $(ev.currentTarget).data("leadId");
            $(ev.currentTarget).data("leadId", "");
            
            // get value and sanitize input in a tmp memory DOM node
            var comment = $("<div/>").text($("#commentLeadPopup textarea").val()).html();

            // reset val for next comment
            $("#commentLeadPopup textarea").val("");
            
            // add comment via webservice
            $.ajax({
                url : Config.baseURL +'?method=AddLeadComment&language='+globalUser.get('LANGUAGE')+'&token='+globalUser.get('TOKEN')+'&leadId='+lId+'&leadStatus=3&comment='+comment,
                success : function (data) {
                    var dataObj = jQuery.parseJSON(data);
                    if (dataObj.SUCCESS) {
                        // reload page
                        me.updateModel(me.update);
                    }
                    else {
                        alert("Your comment cannot be posted.");
                    }
                },
                fail : function () {
                    // error
                    alert("Your comment cannot be posted.");
                }
            });
        },

        displayRefuseLeadPopup : function (ev) {
            
            if (!App.isOnline()) return;
            
            console.log("Refuse lead");

            // display close panel and attach event
            var $target = $('html body'); 
            $target.animate({scrollTop: $target.height()}, 500, function () {
                $('#refuseLeadPopup').slideToggle();
            });
        },

        displayCloseLeadPopup : function (ev) {
            
            if (!App.isOnline()) return;

            console.log("Close lead");

            if (ev !== undefined) {
                ev.preventDefault();

                // if we wanna close a specific lead (sales rep can do that!)
                var id = $(ev.currentTarget).data("id");
                if (id > 0) {
                    $('#closeLeadPopup').data("leadId", id);
                    $('#closeLeadPopup').data("custId", $(ev.currentTarget).data("custid"));
                } else {
                    $('#closeLeadPopup').data("leadId", this.model.get("leads")[0].lead_id);
                    $('#closeLeadPopup').data("custId", globalUser.get('USER').crmid);
                }

            }

            // display close panel and attach event
            var $target = $('html body'); 
            $target.animate({scrollTop: $target.height()}, 500, function () {
                $('#closeLeadPopup').slideToggle();
            });
         },

         displayCommentLead : function (ev) {
            
            console.log("Comment lead");

            if (ev !== undefined) {
                ev.preventDefault();

                // if we wanna comment a specific lead (sales rep can do that!)
                var id = $(ev.currentTarget).data("id");
                if (id > 0) {
                    $('#commentLeadPopup a.comment').data("leadId", id);
                } else {
                    $('#commentLeadPopup a.comment').data("leadId", this.model.get("leads")[0].lead_id);
                }

            }

            // display close panel and attach event
            var $target = $('html body'); 
            $target.animate({scrollTop: $target.height()}, 500, function () {
                $('#commentLeadPopup').slideToggle();
            });

         },

         closeLead : function (ev) {

            if (!App.isOnline()) return;

            console.log("Closing lead");

            var me = this;
            
            // close popup
            this.displayCloseLeadPopup();

            var lId = $("#closeLeadPopup").data("leadId");
            $("#closeLeadPopup").data("leadId", "");

            var cId = $("#closeLeadPopup").data("custId");
            $("#closeLeadPopup").data("custId", "");

            // query webservice
            var idReason = $(ev.currentTarget).attr("data-id");
            var status = -1;
            if (idReason == -1)  {
                status = 4;
            }
            else {
                status = 5;
            }

            $.ajax({
                url : Config.baseURL +'?method=UpdateLead&crmid='+cId+'&language='+globalUser.get('LANGUAGE')+'&token='+globalUser.get('TOKEN')+'&leadId='+lId+'&leadStatus='+status+'&statusData='+idReason,
                success : function (data) {
                    var dataObj = jQuery.parseJSON(data);
                    if (dataObj.SUCCESS) {
                       me.updateModel(me.backToList);
                    }
                    else {
                        alert(dataObj.MESSAGE);
                    }
                }, 
                error : function () {
                    alert("Unable to close this lead due to unknown error.");
                }
            });

         },

         displayAssignLeadList : function () {

            if (!App.isOnline()) return;

            console.log("build Assign View");               
            
            this.$(".project-comments").addClass("hidden");

            // need a search view
            if (!this.$("#customerSearch").is(':empty')) {
                this.$("#customerSearch").empty();
            }
            var searchView = new SearchView({model:this.model});
            searchView.setElement(this.$("#customerSearch")).render();

            // dealers collection
            var dealers = new DealersCollection();

            /*Loop on project.Leads - Id - BEGIN*/
            var aLeads = this.model.get("leads");
            this.aLeadsId = new Array();
            for(var i= 0; i < aLeads.length; i++)
            {
               sLeadsId = aLeads[i].customer.id;
               this.aLeadsId.push(sLeadsId);
            }
            
            /*Loop on project.app Id - BEGIN*/
            var aApps = this.model.get("project").apps;
            var aAppsId = new Array();
            for(var i= 0; i < aApps.length; i++)
            {
               sAppsId = aApps[i].id;
               aAppsId.push(sAppsId);
            }
           /* alert(aLeadsId.length);*/
            
            dealers.meta('ws_qs_zip', this.model.get("project").zip);
            dealers.meta('ws_qs_filter','');
            dealers.meta('ws_qs_applications', aAppsId.join(','));
            
            // generate view from dealers collection
            var me = this;
            dealers.fetch({success: function() {
                /*Parse Dealers */
                  var sDealers ='';
                  dealers.each(function(dealer) {
                        var sCssSelected = "";
                        if(jQuery.inArray(dealer.attributes.id, me.aLeadsId)>-1) {
                            sCssSelected = "ok";
                        }
                        sDealers +='<div class="ui-grid-b"><div id="'+dealer.attributes.id+'" class="selectdealer ui-block-a icon '+sCssSelected+'"></div><div class="ui-block-b adress"><strong>'+dealer.attributes.name+'</strong><br>'+dealer.attributes.phone+'<br>'+dealer.attributes.zipcode+'<strong>'+dealer.attributes.city+'</strong></div><div class="ui-block-c direction"><img src="img/direction.png" /><br> <span>'+dealer.attributes.distance+'</span></div></div>';
                  });
                 

                /*Update View*/
                $(".project-dealers").html(sDealers);
                $("#page").addClass("unassign");
                $(".toolbar-srep.list").hide();
                $(".toolbar-srep.assign").show();
                $(".toolbar-srep.assign").removeClass("hidden");
                $(".project-detail").hide();
                $(".project-enduser").hide();
                $(".project-leads").hide();
                $(".project-dealers").removeClass("hidden");
                $(".project-dealers").show();
                this.$("#customerSearch").show();

                $("#refreshButton").addClass("hidden");

                $("#page").trigger("create");

            }, error: function(collection, response) {
                /*ERROR*/
            }});
         },
         
         selectLead : function (ev) {
            if(_.indexOf(this.aLeadsId, $(ev.currentTarget).attr("id")) < 0) {
               $(ev.currentTarget).toggleClass("ok");
            }
         },
         
         assignLead : function () {

            if (!App.isOnline()) return;

            var me = this;
            var aLeadsId = new Array();
            jQuery('.project-dealers div.selectdealer.ok').each(function(){
                sLeadsId = jQuery(this).attr('id');
                aLeadsId.push(sLeadsId);
            });
            
            /* Call to WS to assign Leads*/
            var data = {
                method:             "AssignLead",
                language:           globalUser.get('LANGUAGE'),
                token:              globalUser.get('TOKEN'),
                projectId:          me.model.get("project_id"),
                projectCustomers:   aLeadsId.join(',')
            };

            // if the status_id is either 1 ("toassign") or 99 ("refused") then we decrement the badge
            var shouldDecrement = false;
            var status_id = me.model.get("status_id");
            if (status_id && (status_id == 1 || status_id == 99)) shouldDecrement = true;

            $.ajax({url:Config.baseURL, data:data,
                success: function (data) {
                    var dataObj = jQuery.parseJSON(data);
                    if (dataObj.STATUS) {
                        if (shouldDecrement) {
                            // Decrement badge
                            if (globalUser.isSalesRep() && window.plugins && window.plugins.pushNotification) {
                                pn = window.plugins.pushNotification;
                                pn.getApplicationIconBadgeNumber(function(num) { 
                                    if (num > 0) pn.setApplicationIconBadgeNumber(num - 1); 
                                    shouldDecrement = false;
                                });
                            }
                        }
                        me.updateModel(me.backToDetail);
                    }
                    else {
                        alert(dataObj.MESSAGE);
                    }
                }, 
                error : function () {
                    alert("Unable to assign leads due to unknown error.");
                }
            });
            
         },

        backToList : function () {
            $("#item-detail").remove();
            initView();
            this.trigger("closeMe");
            this.destroyView();
            currentView = "leads";
        },

        backToDetail : function () {

            this.$(".project-comments").removeClass("hidden");

            $("#page").removeClass("unassign");
            /*Maj Menu*/
            $(".toolbar-srep.list").show();
            $(".toolbar-srep.assign").hide();
            /*Maj content*/
            $(".project-detail").show();
            $(".project-enduser").show();
            $(".project-leads").show();
            $(".project-dealers").hide();
            this.$("#customerSearch").hide();

            /*Forcer la mise à jour*/  
        }, 
        
        showEndUser : function () {
            this.$(".project-enduser").removeClass("hidden");
        }, 

        updateModel : function (callback) {
            
            if (!App.isOnline()) return;
            
            var me = this;
            /*TODO : DEBUGUER LE PROBLEME DU MODELE*/
            var ws_qs_roleid = '&crmid='+globalUser.get('USER').crmid;
            if (globalUser.get('ISSALESREP')==true) {
                ws_qs_roleid = '&salesRepId='+globalUser.get('USER').cn;
            }

            this.model.set({
                ws_qs : ws_qs_roleid+'&siteid='+globalUser.get("SITEID")+'&language='+globalUser.get('LANGUAGE')+'&token='+globalUser.get('TOKEN')+'&projectid='+me.model.get("project").id
            }, {silent:true});

            this.model.fetch({
                success : function (data) {
                    callback.call(me);
                }
            });
        }
    });

    return DetailedItemView;
});