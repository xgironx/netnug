# Modeler interface

The modeler is a separate process. It communicates with the Java server through HTTP calls.

## HTTP API

TBD

## File Format

In general, information will be passed in JSON.

### Basic Elements

There are some basic elements used to describe the fundamental types.

#### Nodes

A node consists only of a unique integer ID.

```
{
	"nodeid": <integer>,
    "model": <optional string>
}
```

#### Links

Each link has a unique integer ID. It also stores the IDs of its from and to nodes, along with the bandwidth it has available. Note that `bandwidth` regularly exceeds the capacity of a 32-bit int.

```
{
	"linkid": <integer>,
	"fromnode": <integer>,
	"tonode": <integer>,
    "model": <optional string>
}
```

#### Demands

Demands have a `demandid`, which is an integer unique to each demand. They also store integer IDs corresponding to the origin (`fromnode`) and destination (`tonode`) nodes.

The `traffic` consists of one or more elements. Each traffic element has a `time` when it starts and an `amount` of traffic. After a traffic element's time, traffic is constant until the next traffic element. Before the earliest traffic element, there is no traffic. `time` is specified in arbitrary units.

```
{
	"demandid": <integer>,
	"fromnode": <integer>,
	"tonode": <integer>,
	"profile": [
		{
			"time": <integer>,
			"amount": <integer>
		}
	
		<repeat 1 or more times>
	],
	"model": <optional string>
}
```

#### Routes

Each route corresponds to a single demand, stored in the `demandid` field. It has an ordered list of link ID's, stored in the `linkids` field, which are the links the route takes from the demand origin to the destination. Finally, it has a `profile` field, which is formatted just like the demand `profile` field.

```
{
	"demandid": <integer>,
    "linkids": [
    	<integer>
        
        <repeat 1 or more times>
    ]
	"profile": [
    	{
        	"time": <integer>,
            "amount": <integer>
        }
        
        <repeat 1 or more times>
    ]
}
```

#### Capacities

Each link has a capacity, but that might have to be adjusted on the fly by the modeller. The modeller should send back the capacity of each link.

```
{
	"linkid": <integer>,
    "capacity": <integer>
}
```

### File Format

#### Model File

On first load, a model file is written. The model file holds 3 arrays: nodes, links, and demands.

```
{
	"nodes": [
    	<node object>
        
        <repeat 0 or more times>
    ],
    "links": [
		<link object>
        
        <repeat 0 or more times>
    ],
    "demands": [
    	<demand object>
        
        <repeat 0 or more times>
    ]
}
```

#### Result File

A result file holds an array of result objects. Each result object corresponds to one of the links in the original model file.

```
{
	"routes": [
    	<route object>
        
        <repeat 1 or more times>
    ],
    "capacities": [
    	<link capacity  object>
        
        <repeat 1 or more times>
    ]
}
```

### Example Files

#### Model File

TBD

#### Result File

TBD
