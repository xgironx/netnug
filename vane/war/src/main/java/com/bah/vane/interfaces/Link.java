package com.bah.vane.interfaces;

public interface Link extends GraphObject, JsonSerializable, Edge {
    Boolean isDuplex();
    String getDirection();
    void setDirection(String direction);
    Link getReverseLink();
    void setReverseLink(Link reverseLink);
    Long getCapacity();
    void setCapacity(Long capacity);
}
