import {xAxis, xScale} from "./properties";
import {createFiltersForGroups} from "./utils";

const PERCENTAGE_TYPE = "percentage";
const VALUE_TYPE = "value";
const graphValueTypes = {
    "Percentage": PERCENTAGE_TYPE,
    "Value": VALUE_TYPE
};

export const configureBarchart = (data, metadata, config) => {
    const {
        xTicks,
        defaultType,
        types: {
            Value: {formatting: valueFormatting, minX: valueMinX, maxX: valueMaxX},
            Percentage: {formatting: percentageFormatting, minX: percentageMinX, maxX: percentageMaxX}
        }
    } = config;

    const {primary_group: primaryGroup} = metadata;

    if (xTicks) {
        xAxis.tickCount = xTicks;
    }

    const {signals: filterSignals, filters} = createFiltersForGroups(metadata.groups);

    return {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        description: "A",
        width: 800,
        background: "white",
        padding: {"left": 5, "top": 5, "right": 30, "bottom": 5},
        data: [
            {
                name: "table",
                values: data,
                transform: [
                    ...filters
                ]
            },
            {
                name: "data_formatted",
                source: "table",
                transform: [
                    {
                        type: "aggregate",
                        ops: ["sum"],
                        as: ["count"],
                        fields: ["count"],
                        groupby: {signal: "groups"}
                    },
                    {
                        type: "joinaggregate",
                        as: ["TotalCount"],
                        ops: ["sum"],
                        fields: ["count"]
                    },
                    {
                        type: "formula",
                        expr: "datum.TotalCount > 0.001 ? datum.count/datum.TotalCount : 0",
                        as: "percentage"
                    },
                    {
                        type: "extent",
                        field: "percentage",
                        signal: "percentage_extent"
                    },
                    {
                        type: "extent",
                        field: "count",
                        signal: "value_extent"
                    }
                ]
            }
        ],
        signals: [
            {
                name: "groups",
                value: [primaryGroup],
            },
            {
                name: "barvalue",
                value: "datum",
            },
            {
                name: "Units",
                value: graphValueTypes[defaultType]
            },
            {
                name: "applyFilter",
                value: false,
            },
            {
                name: "filterIndicator",
            },
            {
                name: "filterValue",
            },
            {
                name: "mainGroup",
                value: primaryGroup,
            },
            {
                name: "numberFormat",
                value: {percentage: percentageFormatting, value: valueFormatting},
            },
            {
                name: "datatype",
                value: {percentage: "percentage", value: "count"},
            },
            {
                name: "percentageMaxX",
                value: percentageMaxX !== "default" ? percentageMaxX : undefined,
            },
            {
                name: "percentageMinX",
                value: percentageMinX !== "default" ? percentageMinX : undefined
            },
            {
                name: "valueMaxX",
                value: valueMaxX !== "default" ? valueMaxX : undefined
            },
            {
                name: "valueMinX",
                value: valueMinX !== "default" ? valueMinX : undefined
            },
            {
                name: "domainMin",
                update: "Units === 'percentage' ? percentageMinX : valueMinX"
            },
            {
                name: "domainMax",
                update: "Units === 'percentage' ? percentageMaxX : valueMaxX"
            },
            {
                name: "y_step",
                value: 30
            },
            {
                name: "height",
                update: "bandspace(domain('yscale').length, 0.1, 0.05) * y_step"
            },
            ...filterSignals
        ],
        scales: [
            {
                name: "yscale",
                type: "band",
                domain: {data: "data_formatted", field: {signal: "mainGroup"}},
                range: {step: {signal: "y_step"}},
                padding: 0.1,
            },
            xScale
        ],

        axes: [
            {
                orient: "left",
                scale: "yscale",
                domainOpacity: 0.5,
                labelOpacity: 0.5,
                tickSize: 0,
                labelPadding: 6,
                zindex: 1,
            },
            xAxis
        ],

        marks: [
            {
                name: "bars",
                from: {data: "data_formatted"},
                type: "rect",
                encode: {
                    enter: {
                        y: {scale: "yscale", field: {signal: "mainGroup"}},
                        height: {scale: "yscale", band: 1},
                        x: {scale: "xscale", field: {signal: "datatype[Units]"}},
                    },
                    update: {
                        fill: {value: "rgb(57, 173, 132)"},
                        y: {scale: "yscale", field: {signal: "mainGroup"}},
                        x: {scale: "xscale", field: {signal: "datatype[Units]"}},
                        x2: {scale: "xscale", value: 0},
                        tooltip: {
                            signal: "{'percentage': format(datum.percentage, numberFormat.percentage), 'group': datum[mainGroup], 'count': format(datum.count, numberFormat.value)}"
                        }
                    },
                    hover: {
                        fill: {value: "rgb(57, 173, 132, 0.7)"},
                    },
                },
            },
            {
                type: "text",
                from: {data: "data_formatted"},
                encode: {
                    enter: {
                        align: {value: "left"},
                        baseline: {value: "middle"},
                        fill: {value: "grey"},
                        fontSize: {value: 10},
                    },
                    update: {
                        text: {
                            signal: "format(datum[datatype[Units]],numberFormat[Units])"
                        },
                        x: {
                            scale: "xscale",
                            field: {signal: "datatype[Units]"},
                            offset: 5,
                        },
                        y: {
                            scale: "yscale",
                            field: {signal: "mainGroup"},
                            band: 0.5,
                        },
                    },
                },
            },
        ],
    };
};

export const configureBarchartDownload = (data, metadata, config, annotations) => {
    const {
        xTicks,
        defaultType,
        types: {
            Value: {formatting: valueFormatting, minX: valueMinX, maxX: valueMaxX},
            Percentage: {formatting: percentageFormatting, minX: percentageMinX, maxX: percentageMaxX}
        }
    } = config;

    const {primary_group: primaryGroup} = metadata;

    if (xTicks) {
        xAxis.tickCount = xTicks;
    }

    const {signals: filterSignals, filters} = createFiltersForGroups(metadata.groups);

    return {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        description: "A",
        width: 800,
        background: "white",
        padding: {"left": 5, "top": 5, "right": 30, "bottom": 5},
        data: [
            {
                name: "table",
                values: data,
                transform: [
                    ...filters
                ]
            },
            {
                name: "data_formatted",
                source: "table",
                transform: [
                    {
                        type: "aggregate",
                        ops: ["sum"],
                        as: ["count"],
                        fields: ["count"],
                        groupby: {signal: "groups"}
                    },
                    {
                        type: "joinaggregate",
                        as: ["TotalCount"],
                        ops: ["sum"],
                        fields: ["count"]
                    },
                    {
                        type: "formula",
                        expr: "datum.TotalCount > 0.001 ? datum.count/datum.TotalCount : 0",
                        as: "percentage"
                    },
                    {
                        type: "extent",
                        field: "percentage",
                        signal: "percentage_extent"
                    },
                    {
                        type: "extent",
                        field: "count",
                        signal: "value_extent"
                    }
                ]
            }
        ],
        signals: [
            {
                name: "groups",
                value: [primaryGroup],
            },
            {
                name: "barvalue",
                value: "datum",
            },
            {
                name: "Units",
                value: graphValueTypes[annotations.graphValueType]
            },
            {
                name: "applyFilter",
                value: false,
            },
            {
                name: "filterIndicator",
            },
            {
                name: "filterValue",
            },
            {
                name: "mainGroup",
                value: primaryGroup,
            },
            {
                name: "numberFormat",
                value: {percentage: percentageFormatting, value: valueFormatting},
            },
            {
                name: "datatype",
                value: {percentage: "percentage", value: "count"},
            },
            {
                name: "percentageMaxX",
                value: percentageMaxX !== "default" ? percentageMaxX : undefined,
            },
            {
                name: "percentageMinX",
                value: percentageMinX !== "default" ? percentageMinX : undefined
            },
            {
                name: "valueMaxX",
                value: valueMaxX !== "default" ? valueMaxX : undefined
            },
            {
                name: "valueMinX",
                value: valueMinX !== "default" ? valueMinX : undefined
            },
            {
                name: "domainMin",
                update: "Units === 'percentage' ? percentageMinX : valueMinX"
            },
            {
                name: "domainMax",
                update: "Units === 'percentage' ? percentageMaxX : valueMaxX"
            },
            {
                name: "y_step",
                value: 30
            },
            {
                name: "height",
                update: "bandspace(domain('yscale').length, 0.1, 0.05) * y_step"
            },
            {
                name: "title",
                value: annotations.title
            },
            {
                name: "source",
                value: metadata.source !== undefined && metadata.source !== null && metadata.source.length > 0 ? `Source : ${metadata.source}` : ''
            },
            {
                name: "geography",
                value: annotations.geography
            },
            {
                name: "filters",
                value: annotations.filters
            },
            {
                name: "attribution",
                value: annotations.attribution
            },
            {
                name: "chart_bottom",
                update: "height + 40"
            },
            ...filterSignals
        ],
        title: {
            text: {signal: "title"},
            subtitleFontStyle: "italic",
            anchor: "start",
            frame: "group"
        },
        scales: [
            {
                name: "yscale",
                type: "band",
                domain: {data: "data_formatted", field: {signal: "mainGroup"}},
                range: {step: {signal: "y_step"}},
                padding: 0.1,
            },
            xScale
        ],
        axes: [
            {
                orient: "left",
                scale: "yscale",
                domainOpacity: 0.5,
                labelOpacity: 0.5,
                tickSize: 0,
                labelPadding: 6,
                zindex: 1,
            },
            xAxis
        ],
        marks: [
            {
                name: "bars",
                from: {data: "data_formatted"},
                type: "rect",
                encode: {
                    enter: {
                        y: {scale: "yscale", field: {signal: "mainGroup"}},
                        height: {scale: "yscale", band: 1},
                        x: {scale: "xscale", field: {signal: "datatype[Units]"}},
                    },
                    update: {
                        fill: {value: "rgb(57, 173, 132)"},
                        x: {scale: "xscale", field: {signal: "datatype[Units]"}},
                        x2: {scale: "xscale", value: 0},
                        tooltip: {
                            signal: "{'percentage': format(datum.percentage, numberFormat.percentage), 'group': datum[mainGroup], 'count': format(datum.count, numberFormat.value)}"
                        }
                    },
                    hover: {
                        fill: {value: "rgb(57, 173, 132, 0.7)"},
                    },
                },
            },
            {
                type: "text",
                from: {data: "data_formatted"},
                encode: {
                    enter: {
                        align: {value: "left"},
                        baseline: {value: "middle"},
                        fill: {value: "grey"},
                        fontSize: {value: 10},
                    },
                    update: {
                        text: {
                            signal: "format(datum[datatype[Units]],numberFormat[Units])"
                        },
                        x: {
                            scale: "xscale",
                            field: {signal: "datatype[Units]"},
                            offset: 5,
                        },
                        y: {
                            scale: "yscale",
                            field: {signal: "mainGroup"},
                            band: 0.5,
                        },
                    },
                },
            },
            {
                type: "text",
                interactive: false,
                encode: {
                    enter: {
                        y: {signal: "chart_bottom"},
                        text: {
                            "signal":
                                (annotations.attribution !== undefined && annotations.attribution.length > 0) ?
                                    "[filters + geography, attribution, source]" :
                                    "[filters + geography, source]"
                        },
                        baseline: {value: "bottom"},
                        fontSize: {value: 14},
                        fontWeight: {value: 500},
                        fill: {value: "black"}
                    }
                }
            },
        ],
    };
};
