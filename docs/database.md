# Database Documentation

The database is a PostgreSQL instance hosted on AWS RDS.

## Connection information

The database connection must come from an AWS instance in security group database-access (Group ID `sg-6b652f11`). The testing instances should all have access.

Item|Value
---|---
URL|postgres:\\\\vane-primary.cszriew51nor.us-east-1.rds.amazonaws.com:5432
Database Name|vane
Root User|vaneadmin
Password|Contact [Daniel Dulaney](mailto:dulaney_daniel@bah.com)

## Structure

Each item in the OPNET XML file is represented as a table.

The highest-level structure is a subnet. A subnet may have another parent subnet, or it may be a top-level subnet.

Each node is a part of exactly one subnet. Each interface is associated with exactly one node. Links and demands are associated with exactly two interfaces, known as A and Z. 

### subnets
Name|Type|Description
---|---|---
subnetID|serial, primary key|
name|varchar(256)|Subnet name
parent|integer, foreign key|Corresponds to subnets.subnetID

### nodes
Name|Type|Description
---|---|---
nodeID|serial, primary key|
x|float|Horizontal position (screen coordinates)
y|float|Vertical position (screen coordinates)
lat|float|Latitude
lon|float|Longitude
name|varchar(256)|Node name
subnet|integer, foreign key|Corresponds to subnets.subnetID
equipment|varchar(256)|Human-readable description of equipment
ip|inet|Node IP address

### links
Name|Type|Description
---|---|---
linkID|serial, primary key|
nodeA|integer, foreign key|Origin node, corresponds to nodes.nodeID
nodeZ|integer, foreign key|Destination node, corresponds to nodes.nodeID
capacity|float|Link capacity in bps (bits per second)
direction|enum('A-Z', 'Z-A', 'both')|Which direction the link can carry data

### demands
Name|Type|Description
---|---|---
demandID|serial, primary key|
name|varchar(256)|Demand name
traffic|float|Traffic amount in bps
nodeA|integer, foreign key|Origin node, corresponds to nodes.nodeID
nodeZ|integer, foreign key|Destination node, corresponds to nodes.nodeID
