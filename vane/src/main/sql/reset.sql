DROP TABLE IF EXISTS subnets CASCADE;

CREATE TABLE subnets (
	id serial PRIMARY KEY,
	name varchar(256),
	description varchar(2048),
	lat real,
	lng real,
	units varchar(256),
	degrees boolean,
	icon varchar(256),
	queued boolean,
	analysisCount int,
	scenarios integer[],
	parent int REFERENCES subnets
);

DROP TABLE IF EXISTS nodes CASCADE;

CREATE TABLE nodes (
	id serial PRIMARY KEY,
	name varchar(256),
	model varchar(256),
	lat real,
	lng real,
	icon varchar(256),
	parent int REFERENCES subnets
);

DROP TABLE IF EXISTS links CASCADE;

CREATE TABLE links (
	id serial PRIMARY KEY,
	name varchar(256),
	model varchar(256),
	fromNode int REFERENCES nodes,
	toNode int REFERENCES nodes,
	capacity bigint,
	duplex boolean,
	direction varchar(256),
	reverseLink int REFERENCES links,
	parent int REFERENCES subnets
);

DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
	id serial PRIMARY KEY
);

DROP TABLE IF EXISTS points CASCADE;

CREATE TABLE points (
	id serial PRIMARY KEY,
	time numeric,
	amount bigint,
	profile int REFERENCES profiles
);

DROP TABLE IF EXISTS demands CASCADE;

CREATE TABLE demands (
	id serial PRIMARY KEY,
	name varchar(256),
	model varchar(256),
	fromNode int REFERENCES nodes,
	toNode int REFERENCES nodes,
	profile int REFERENCES profiles,
	parent int REFERENCES subnets
);

DROP TABLE IF EXISTS paths CASCADE;

CREATE TABLE paths (
	id serial PRIMARY KEY,
	name varchar(256),
	model varchar(256),
	profile int REFERENCES profiles,
	parent int REFERENCES subnets
);

DROP TABLE IF EXISTS PATH_NODES CASCADE;

CREATE TABLE PATH_NODES (
	path_id int REFERENCES paths,
	node_id int REFERENCES nodes
);

DROP TABLE IF EXISTS PROJECT_SCENARIOS CASCADE;

CREATE TABLE PROJECT_SCENARIOS (
	subnet_id int REFERENCES subnets,
	scenario_id int REFERENCES subnets
);
