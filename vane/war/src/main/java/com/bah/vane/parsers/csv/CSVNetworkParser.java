package com.bah.vane.parsers.csv;

import java.nio.file.Path;
import java.nio.file.Paths;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.io.FileWriter;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;
import java.util.Scanner;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonReader;
import javax.json.JsonStructure;
import javax.json.JsonValue;

import com.bah.vane.interfaces.Demand;
import com.bah.vane.interfaces.Link;
import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Profile;
import com.bah.vane.interfaces.Subnet;

/**
 * A JsonNetworkParser returns a JsonObject representation of a Subnet object.
 *
 * @author "Andrew Merrill <merrill_andrew@bah.com>"
 */
public class CSVNetworkParser {

    private Subnet network;
    // private JsonObject jsonNetwork;

    public CSVNetworkParser() {}

    public CSVNetworkParser(Subnet network) {
        this.network = network;
        // this.csvNetwork = null;
        // this.csvNetwork = CSVNetworkParser.toCSV(network);
    }

    public Subnet getNetwork() {
        return this.network;
    }

    // public JsonValue getCSVNetwork() {
    //     return this.csvNetwork;
    // }

}
