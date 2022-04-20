const Event = require("../models/event.model");
const {getTextButton, getLinkButton, getPhoto, getDefault, getNewElement} = require('../helpers/element')

exports.createEvent = async ({name, startDate, endDate, locationName, locationAddress, locationCoordinates, business, photos, tags, type}) => {
    let createdEvent = new Event(
        {
            name,
            business,
            startDate,
            endDate,
            locationName,
            locationAddress,
            locationCoordinates,
            photos,
            tags,
            type,
            currentPrecision: [21, 20],
            paidPrecision: 21
        }
    );

    

    const event = await createdEvent.save()
    console.log(event)
    setEventMapPrecision({event: event._id})

    return event

}

const setEventMapPrecision = async ({event}) => {
    console.log(event)
    const eventObject = await Event.findOne({_id: event})
                    .lean()
                    .select("locationCoordinates")
    console.log(eventObject)

    if(eventObject) {
        const center = eventObject.locationCoordinates.coordinates
        let newPrecicions = []
        for(let i = 0; i < zoomPrecision.length; i++) {
            const zoom = zoomPrecision[i]
            const boundsArray = [ 
                [ center[0] + zoom.prec, center[1] - zoom.prec ], 
                [ center[0] - zoom.prec, center[1] - zoom.prec],
                [ center[0] - zoom.prec, center[1] + zoom.prec],
                [ center[0] + zoom.prec, center[1] + zoom.prec],
                [ center[0] + zoom.prec, center[1] - zoom.prec], 
            ]
            
            let events = await Event.find({
                $and: [
                    {
                        currentPrecision: { $in: [zoom.zoom] }
                    },
                    {
                        locationCoordinates: { 
                            $geoWithin: { 
                                $geometry: {
                                    type: 'Polygon', 
                                    coordinates: [ boundsArray ] 
                                } 
                            } 
                        }
                    }
                ]
            })
            .lean()
            .select("_id paidPrecision")
            console.log(events)
            if(events.length >= 1 && events[0]._id !== event) {

            }
            else {
                newPrecicions.push(zoom.zoom)
                console.log(newPrecicions)
            }
        }
        console.log(newPrecicions)
        console.log('setting precision')

        const result = await Event.updateOne(
            {_id: event }, 
            { $set: { 'currentPrecision': newPrecicions }}
        )

    }
}

exports.getEventsBusiness = async ({business}) => {
    

    const events = Event.find({business: business})
                    .lean()
                    .select("_id name tags startDate endDate locationName locationAddress locationCoordinates photos")

    return events

}

exports.getEventBusiness = async ({business, event}) => {
    const eventInfo = Event.findOne({business: business, _id: event})
                    .lean()
                    .select("_id name tags startDate endDate locationName locationAddress locationCoordinates photos elements")

    return eventInfo
}

exports.addElementEvent = async ({business, event, element}) => {
    console.log(element)
    let newElement = getDefault(element.type)

    newElement.x = element.x
    newElement.y = element.y
    newElement.h = element.h
    newElement.w = element.w
    newElement.id = await getNewId(event)

    const result = await Event.updateOne(
                            {_id: event, business }, 
                            { $push: { elements: newElement }}
                        )
    const updatedEventElements = await Event.findOne({_id: event}).lean().select("elements")
    return updatedEventElements
}

exports.editElement = async ({business, event, element}) => {
    let newElement = getNewElement(element)    
    newElement.x = element.x
    newElement.y = element.y
    newElement.h = element.h
    newElement.w = element.w
    newElement.id = element.id



    const result = await Event.updateOne(
            {_id: event, business, 'elements.id': element.id }, 
            { $set: { 'elements.$': newElement }}
        )

    const updatedEventElements = await Event.findOne({_id: event}).lean().select("elements")

    return updatedEventElements
       
}


exports.updateElementLayout = async ({business, event, elements}) => {
    const eventElements = await Event.findOne({_id: event, business}).lean().select("elements")
    
    let newElements = []
    eventElements.elements.forEach(prop => {
        let incomingElement = getElementFromArray(prop.id, elements)
        if(incomingElement) {
            let newElement = {...prop}
            newElement.x = incomingElement.x
            newElement.y = incomingElement.y
            newElement.h = incomingElement.h
            newElement.w = incomingElement.w
            newElements.push(newElement)
        }
    })
    const result = await Event.updateOne(
                        {_id: event, business }, 
                        { $set: { elements: newElements }}
                    )
    console.log(result)
    return newElements
}



const getElementFromArray = (id, arr) => {
    for(let k = 0 ; k < arr.length ;k++) {
        if(arr[k].i == id) 
            return arr[k]  
    }

    return null
}



const getNewId = async (event) => {
    let newId = makeid(5)
    const eventElements = await Event.findOne({_id: event}).lean().select("elements")

    while(!idUnique(newId, eventElements.elements)) {
        newId = makeid(5)
    }
    return newId
}

const idUnique = (id, arr) => {
    for(let i = 0 ; i < arr.length ;i++) {
        if(arr[i].id === id)
            return false
    }
    return true
}

const makeid = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

exports.getEventsInBox = async ({topLeftCoords, bottomRightCoords}) => {
    if(topLeftCoords.lat && topLeftCoords.lng && bottomRightCoords.lat && bottomRightCoords.lng) {
        const bottomLeftCoords = {...topLeftCoords, lat: bottomRightCoords.lat}
        const topRightCoords = {...bottomRightCoords, lat: topLeftCoords.lat}

        const boundsArray = [ 
            [ topLeftCoords.lat, topLeftCoords.lng ], 
            [ bottomLeftCoords.lat, bottomLeftCoords.lng ], 
            [ bottomRightCoords.lat, bottomRightCoords.lng ], 
            [ topRightCoords.lat, topRightCoords.lng ],
            [ topLeftCoords.lat, topLeftCoords.lng ], 
        ]

        let events = await Event.find({
            $and: [
                {locationCoordinates: { 
                    $geoWithin: { 
                        $geometry: {
                            type: 'Polygon', 
                            coordinates: [ boundsArray ] 
                        } 
                    } 
                }}
            ]
        })
        .lean()
        .select("_id name tags startDate endDate locationName locationAddress locationCoordinates photos")
        return events

    }


    else {
        throw "coords wrong"
    }
}

exports.getEventsInBoxMap = async ({topLeftCoords, bottomRightCoords, zoom}) => {
    if(topLeftCoords.lat && topLeftCoords.lng && bottomRightCoords.lat && bottomRightCoords.lng && zoom) {
        const bottomLeftCoords = {...topLeftCoords, lat: bottomRightCoords.lat}
        const topRightCoords = {...bottomRightCoords, lat: topLeftCoords.lat}

        const boundsArray = [ 
            [ topLeftCoords.lat, topLeftCoords.lng ], 
            [ bottomLeftCoords.lat, bottomLeftCoords.lng ], 
            [ bottomRightCoords.lat, bottomRightCoords.lng ], 
            [ topRightCoords.lat, topRightCoords.lng ],
            [ topLeftCoords.lat, topLeftCoords.lng ], 
        ]

        let events = await Event.find({
            $and: [
                {
                    currentPrecision: { $in: [zoom] }
                },
                {locationCoordinates: { 
                    $geoWithin: { 
                        $geometry: {
                            type: 'Polygon', 
                            coordinates: [ boundsArray ] 
                        } 
                    } 
                }}
            ]
        })
        .lean()
        .select("_id name tags type startDate endDate locationCoordinates")
        return events

    }


    else {
        throw "coords wrong"
    }
}

exports.getEventInfo = async ({ event}) => {
    const eventInfo = Event.findOne({_id: event})
                    .lean()
                    .select("_id name tags startDate endDate locationName locationAddress locationCoordinates photos elements")

    return eventInfo
}


const zoomPrecision = [
    {zoom: 3, prec: 9.8304},
    {zoom: 4, prec: 4.9152},
    {zoom: 5, prec: 2.4576},
    {zoom: 6, prec: 1.2288},
    {zoom: 7, prec: 0.6144},
    {zoom: 8, prec: 0.3072},
    {zoom: 9, prec: 0.1536},
    {zoom: 10, prec: 0.084},
    {zoom: 11, prec: 0.042},
    {zoom: 12, prec: 0.0192},
    {zoom: 13, prec: 0.0096},
    {zoom: 14, prec: 0.0048},
    {zoom: 15, prec: 0.003},
    {zoom: 16, prec: 0.0012},
    {zoom: 17, prec: 0.0006},
    {zoom: 18, prec: 0.0003},
    {zoom: 19, prec: 0.00015},
    {zoom: 20, prec: 0.000072},
    {zoom: 21, prec: 0.000036},
]