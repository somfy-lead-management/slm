define(
    [
        'text!templates/lists/leaditem.html',
        'views/helpers/util'
    ],

    function(template, helpers) {

        var LeadItemView = Backbone.View.extend({

            template: _.template(template),

            events: {},

            initialize: function() {},

            setCollection : function (c) {
                this.collection = c;
                this.collection.on('change', this.render, this);
            },

            render: function() {
                var $el = $(this.el);

                var $items = this.$el.empty();
                _.each(this.collection.models, function(model) {
                    var data = model.toJSON();
                    _.extend(data, helpers);
                    $el.append(this.template(data));
                }, this);

                if (globalUser.get('ISSALESREP')==true) {
                    _.each($("#leads-list li"), function(child) {
                        if ($.trim($(child).find(".dealerstatus")[0].innerHTML) != ''){
                            $(child).find(".type").remove();
                            $(child).find(".resume").remove();
                        }
                    });
                }

                return this;
            }
        });

        return LeadItemView;
    }
);