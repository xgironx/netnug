package com.bah.vane.parsers.json;

import java.nio.file.Path;
import java.nio.file.Paths;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.io.FileWriter;

import java.util.Scanner;

import javax.json.Json;
import javax.json.JsonReader;
import javax.json.JsonValue;

/**
 * JsonParser is a helper class for parsing JSON
 *
 * @author "Andrew Merrill <merrill_andrew@bah.com>"
 */
public class JsonParser {

    private static String convertStreamToString(InputStream is) {
        Scanner s = new Scanner(is).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
    }

    public static JsonValue jsonFromString(String jsonString) {

        JsonReader jsonReader = Json.createReader(new StringReader(jsonString));
        JsonValue jsonVal = jsonReader.readObject();
        jsonReader.close();
        return jsonVal;
    }

    public static JsonValue jsonFromInputStream(InputStream is) {

        return jsonFromString(convertStreamToString(is));
    }

    public static void writeJson(String filePath, JsonValue jsonValue) {
        Path fPath = Paths.get(filePath);

        try (FileWriter writer = new FileWriter(fPath.toString())) {
            writer.write(jsonValue.toString());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
