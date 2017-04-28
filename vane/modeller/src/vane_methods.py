'''
Created on Oct 31, 2016

@author: mel
'''
from operator import pos
from numba.dummyarray import Dim
from networkx.algorithms.flow.capacityscaling import capacity_scaling
'''
Created on Oct 28, 2016

@author: mel
'''

import numpy as np
import matplotlib.pyplot as plt
import csv
import copy
import networkx as nx

DirName = 'C:\Users\mel\Documents\Python_Scripts\\'

class Vertex:
    def __init__(self,Id,Name,Loc_code,Tz,X,Y):
        self.Id = Id
        self.Name = Name.strip(' ')
        self.Loc_code = Loc_code
        self.Tz = Tz
        self.X = float(X)
        self.Y = float(Y)
        
    def Print(self):
      
        print "============================= Name = %s ===================" %self.Name
        print "\t Id            =",self.Id
        print "\t Name          =",self.Name
        print "\t X cord        =", self.X
        print "\t Y coord       =", self.Y
        print "\t Location Code =",self.Loc_code
        print "/t Time Zone     =",self.Tz
        
    
        
class Node(Vertex):
    def __init__(self,Id,Name,X,Y,Subnet,Loc_code,Tz,Equip):
        Vertex.__init__(self,Id,Name,Loc_code,Tz,X,Y)
        self.Subnet = Subnet
        self.Equip = Equip
        
        self.interface_ip = {} # make this a dictionary, so you can label the interfaces with IP
        self.port_no = []
        
    '''

    classdocs Represents a node record a list of nodes are the Network Nodes
    '''



    '''
        Constructor id key to the node table. Auto generated integer
        X Y = float for plotting
        Desc = Str Description
        Subnet Str references the Subnet class
        Equip Str Name of equipment
    '''
    
        
    def add_interface(self,interface):
        self.interface_ip = interface
        
    def add_port(self,port):
        self.port_no.append(port)
        
    def Print(self):
        
        Vertex.Print(self)
        print "\t Subnet        =" , self.Subnet
        print "\t Equipment     = ", self.Equip
        print "\t ======================== Ports %i ========================" %len(self.port_no)
        for it in self.port_no:
            print "\t\t Prot Number = " ,it
        print "\t ======================== Interfaces %i ========================" %len(self.interface_ip)
        ks = self.interface_ip.keys()
        for it in ks:
            print "\t",it," ==> ", self.interface_ip[it]
        
#=================================================================================================================
class Subnet(Vertex):
    def __init__(self,Id,Name,X,Y,Loc_code,Tz,Parentid):
  
        Vertex.__init__(self,Id,Name,Loc_code,Tz,X,Y)
        self.Parentid = Parentid 
        self.Parent = []
        
    def Print(self):
        print"\n"
        Vertex.Print(self)
        print " Parent ID   =", self.Parentid
        print " Parent List + ",
        for it in self.Parent:
            print it.Id,
        
   
        
    
    '''
    classdocs Represents a subnets in the network
    

        Initializes the class
    Args:
    Id key to thesubnet record   X Y = float for plotting
        Desc = Str Description
        Parentid refers to the subnet's paret. ... Sbnet can and are nested
    
                
        '''
    
        
    def add_parents(self,parent):
            self.Parent.append(parent)
            
          
            
#==================================================================================================
class Interface:
                
    def __init__(self, Id, Desc, Speed):
        
        self.Id  = Id
        self.Desc = Desc
        self.Speed  = float(Speed)
        
#==================================================================================================
class Traffic:
    
    def __init__(self,Id,Traffic_rate):
        self.Id = Id
        self.Traffic_rate = Traffic_rate  #2D Array  x (0) time in seconds y (1)  in Bps
        
    def Print(self):
        print "======================== %s ===================" %self.Id
        print "Traffic Id = ",self.Id
        print_mtx(self.Traffic_rate)
        
        
#====================================================================================
class Edge():
    def __init__(self,Id,Desc,Type,NodeA,NodeZ,Direction):
        
        
        self.Id =id
        self.Desc = Desc
        self.Type = Type
        self.NodeA = NodeA
        self.NodeZ = NodeZ
        self.Direction = Direction
        
        

    def Print(self):
      
        print "= %i ===================" %self.Id
        print "Id          = ",self.Id
        print "Description = ", self.Desc
        print " Type       = ",self.Type
        print "Node A Id = %i Name = %s" %(self.NodeA.Id, self.NodeA.Name)
        print "Node Z Id = %i Name = %s" %(self.NodeZ.Id, self.NodeZ.Name)
        print "Direction     = ", self.Direction
    
        
class Link(Edge):
   
    def __init__(self, Id,Desc,Type,NodeA,PortA,NodeZ,PortZ,Capacity,Traffic_pattern,Direction):
        Edge.__init__(self,Id,Desc,Type,NodeA,NodeZ,Capacity)
        self.Capacity = float(Capacity)
      
        self.PortA = PortA
        self.PortZ = PortZ
        self.Traffic_pattern = Traffic_pattern
 
    def Print(self):
        print "==================================Link Id ",
        Edge.Print(self)

#         print "Capacity      = %.2e bps" %self.Capacity
#         tmp1,tmp2 = self.Max_traffic()
#         print "Max        = %.2e bps   at  " % tmp1
#         print "Port A Number = ", self.PortA
#    
#         print "Port Z Number = ", self.PortZ
#         print "============  Traffic Pattern =============="
#         #print_mtx(self.Traffic_pattern)
        
    def Graph_it(self):
        fname = DirName+"\\"+"link"+str(self.Id)
        s = self.Desc +" "+self.NodeA.Name +" ---> "+ self.NodeZ.Name
        plt.clf()
        plt.title(s)
        plt.grid(True)
        plt.plot(self.Traffic_pattern[:,0],self.Traffic_pattern[:,1])
        plt.savefig(fname)
        
    def Total(self):
        i = 1
        Total = 0.0
        N = self.Traffic.Traffic_rate.shape[0]
       
        while i < N:
            d_time = self.Traffic.Traffic_rate[i,0] - self.Traffic.Traffic_rate[i-1,0]
            Total = Total + d_time * self.Traffic.Traffic_rate[i-1,1]
            i+=1
        return Total
    
    def Max_traffic(self):
        max = np.amax(self.Traffic_pattern[:,1])
        indx = np.where(self.Traffic_pattern[:,1] == max)
        
        
        return max,indx
    
    def Average(self):
        avg = np.average(self.Traffic_pattern[:,1])
        
        return avg
    
    def Summary(self):
        
        Total = self.Total()
        Max,ind = self.Max_traffic()
        Avg = self.Average()
        End_time = self.self.Traffic_pattern[-1:,0][0]
        items = self.self.Traffic_pattern.shape[0]
        
        return (Total,Max,Avg,End_time,items)
        
            
        
  
        
#=====================================================================================

class Route(Edge):
    
    def __init__ (self, Id,Desc,Type,NodeA,NodeZ,Direction,Hops,Value,Capacity,Current):
        Edge.__init__(self, Id, Desc, Type, NodeA, NodeZ, Direction)
        self.Hops = int(Hops)
        self.Value = float(Value)
        self.Capacity = float(Capacity)
        self.Current = float(Current)
        self.Links = [] # List of links that describe the route
        
    
        '''
    classdocs Represents a Routes in the network
    
    
    '''

        
        '''
        Initializes the class
    Args:
    Id key to Route  record  
        Desc = Str Description
        NodeA is the Start of the Route
        NodeZ is the tail (end) of the route
        NodeA and NodeZ both are objects referencing the Node Class
        Hops is the number of hops (links) Direct = 0
        Value is the Cost or distance metric value( created by the network routing protocol
 
         '''
        
    def add_links(self,link):
        self.Links.append(link)
        
    def Get_capacity(self):
        if len(self.Links):
            capacity = self.Links[0]
            for it in self.Links:
                if it.Capacity < capacity:
                    capacity= it.Capacity
        capacity = 0.0
        
        return(capacity)
            

        
    def Print(self):
        
        print "================================ Route", 
        Edge.Print(self)
        
        print "Hops         = ",self.Hops
        print "Value        = ",self.Value
        print "Capacity     = ",self.Capacity 
        print "Current size = ",self.Current
        print "-------------------------------- Links %i---------------------"%len(self.Links)
        for it in self.Links:
            #it.Desc
            it.Print()
            
                
#=====================================================================================================
class Demand(Edge):
    def __init__ (self,Id,Desc,Type,NodeA,NodeZ,Direction,Traffic):
       
        Edge.__init__(self, Id, Desc, Type, NodeA, NodeZ, Direction)
        
        self.Traffic = Traffic # array time = seconds rate = bps
        self.Route = [] # Consider 2 dim array where dim 0 is Route id Dim 1 = time period and value is percentage of traffic being carried
   
        
        '''
        Id; Key to the Demand Table
        Desc: Describtion
        NodeA is the Start of the Demand
        NodeZ is the tail (end) of the Demand
        Traffic: np 2 dim array(0 dim is time in seconds, Dim 1 traffic rate in bit/sec during that time period
        Routes: List of routes that the demand uses
    
        
        '''
        
  
    def Total(self):
        i = 1
        Total = 0.0
        N = self.Traffic.Traffic_rate.shape[0]
       
        while i < N:
            d_time = self.Traffic.Traffic_rate[i,0] - self.Traffic.Traffic_rate[i-1,0]
            Total = Total + d_time * self.Traffic.Traffic_rate[i-1,1]
            i+=1
        return Total
    
    def Max_traffic(self):
        max = np.amax(self.Traffic.Traffic_rate[:,1])
        indx = np.where(self.Traffic.Traffic_rate[:,1] == max)
        
        
        return max,indx
    
    def Average(self):
        avg = np.average(self.Traffic.Traffic_rate[:,1])
        
        return avg
    
    def Summary(self):
        
        Total = self.Total()
        Max,ind = self.Max_traffic()
        Avg = self.Average()
        End_time = self.Traffic.Traffic_rate[-1:,0][0]
        items = self.Traffic.Traffic_rate.shape[0]
        
        return (Total,Max,Avg,End_time,items)
    
    def Graph_it(self):
        fname = DirName+"\\"+"Demand"+str(self.Id)
        s = self.NodeA.Desc + "-->"+self.NodeZ.Desc
        plt.clf()
        plt.title(s)
        plt.grid(True)
        plt.plot(self.Traffic.Traffic_rate[:,0],self.traffic.Traffic_rate[:,1])
        plt.savefig(fname)
        
    def Print(self):
       
        print "===============================Demand " ,
        Edge.Print(self)
     
    
        
        print "-------------------- Routes %i -----------------------------" %len(self.Route)
        for it in self.Route:
                it.Print()

        print "--------------------- Traffic Profile % i --------------------" %self.Traffic.Id
        i = 0
        N = self.Traffic.Traffic_rate.shape[0]
        Max,idx = self.Max_traffic()
  
        while i < N:
            print " Traffic [%i] = %f,%f" %(i,self.Traffic.Traffic_rate[i,0],self.Traffic.Traffic_rate[i,1])
            i+=1
        
        try:
            print "Total Traffic = %f Bits" %self.Total()
            print "Average Traffic = %f Bits per second" %self.Average()
            try:
               
                print "Maximum Traffic = % f, at %i " %(Max,self.Traffic.Traffic_rate[idx,0])
            except TypeError:
                print "Multi Valued Traffic = %f, at: "%Max
                for it in idx:
                    print "\t ",self.Traffic.Traffic_rate[it,0]
        except AttributeError:
            print "No Traffic profile"
            
#========================================================================================================
class Path(Edge):
    def __init__(self,Id,Type,Desc,NodeA,NodeZ,Direction ):
        Edge.__init__(self, Id, Desc, Type, NodeA, NodeZ, Direction)
        self.Links = [] 
        
        '''
        Id: key for path table
        Desc describes the path
        NodeA is the Start of the Path
        NodeZ is the tail (end) of the Path
        Type is the path [speciically LSP
        '''
   
         # List of links that describe the Path
        
        
    def Add_links(self,link):
        self.Links.append(link)
        
    def Print(self):
        print "============================== path Id ",
        Edge.Print(self)

        print "---------------------- %i LINKS --------------------------------------------" %len(self.Links)
        for it in self.Links:
            it.Print()

"====================================================================================================="

class Location:
    def __init__(self,Loc_code,Name,State,Tz,Lat,Long):
        self.Loc_code = Loc_code
        self.Name = Name.strip(' ')
        self.State = State
        self.Tz = Tz
        self.Lat = float(Lat)
        self.Long = float(Long)
        
    def Print(self):
      
        print "============================= Name = %s ===================" %self.Name
        print "\t Location Code =",self.Loc_code
        print "\t Name          =",self.Name," ",self.State
        print "\t X cord        =", self.Lat
        print "\t Y coord       =", self.Long
        print "\t Time Zone     =",self.Tz
  
"=========================================================================="      
    
class Adj_mtx:
    
    '''
    MTX = 2 Dim numpy array Node X Node vale 0 not connected 1 is connected
    Hops number of via nodes
    Desc : Description
    '''
    
    def __init__(self,Mtx,Desc,Hops):
        self.Mtx = Mtx
        self.Desc = Desc
        self.Hops = Hops
        
    def Print(self,M = 0):
        print "====================================== Adjecent Matrix ==========================="
        print "Description   = ",self.Desc
        print "Hops          =",self.Hops
        print "Non Zero      =",np.count_nonzero(self.Mtx)
        if M:
            print "-------------------------------- Matrix -----------------------------------------"
            print_mtx(self.Mtx)
            
"========================================================================================================"
class Network:
    
    '''
    Contain that contains list of all of the objects that make up a Network
    
    '''
    def __init__ (self,Id,Name,Desc): 
        
        self.Id = Id
        self.Name = Name
        self.Desc = Desc
        self.Node = () # this a tuple and is immutable
        self.Subnet = []
        self.Route = []
        self.Link =[]
        self.Path = []
        self.Demand = [] 
         
        self.Traffic = []
        self.Adj_mtx = []


    def add(self,item,record):
        
        id = len(self.item)
        id +=1
        record.Id = id
        self.item.append(record)

    def add_node(self,n): 
        node = copy.copy(n)
        id = len(self.Node)
        node.X = float(node.X)
        node.Y = float(node.Y)
        id+=1
        node.Id = id
    
        self.Node = self.Node + (node,) 
        
    def add_link(self,L): 
        Lnk = copy.copy(L)
        id = len(self.Link)
        id+=1
        Lnk.Id = id
    
        self.Link.append(Lnk)
        return(id) 
        
    
    def add_traffic(self,T): 
        Traf = copy.copy(T)
        id = len(self.Traffic)
        id+=1
        Traf.Id = id
        self.Traffic.append(Traf)
        
    def sort(self, item,value):
        if item == "Vertex":
            if value == "Id":
                self.Vertex.sort(key = lambda x: x.Id)
            elif value == 'Desc':
                self.Vertex.sort(key = lambda x: x.Desc)
            else:
                return(0)
        elif item == "Edge":
            if value == "Id":
                self.Edge.sort(key = lambda x: x.Id)
            elif value == 'Desc':
                self.Vertex.sort(key = lambda x: x.Desc)
            elif value == "NodeA":
                self.Vertex.sort(key = lambda x: x.NodeA.Name)
                
                return(0)
            
        
        return()
    
        
    def new_node(self,name,dec,x,y,subnet,equip): 
    
     
        temp = Node(id,name,dec,x,y,subnet,equip) 
        self.add_node(temp)
      
            
    
        
    def add_route(self,rte,Rt_tbl= 0): 
        
        route = copy.copy(rte)
        id = len(self.Route)
        id+=1
        route.Id = id
    
        self.Route.append(route)
        
        typ = str(type(Rt_tbl))
      
        if typ.find("ndarray") != -1:
#Add route to route table
          
            if Rt_tbl[route.NodeA.Id,route.NodeZ.Id] != 0:
                Rt_tbl[route.NodeA.Id,route.NodeZ.Id].append(route)
               
            else:
                Rt_tbl[route.NodeA.Id,route.NodeZ.Id]= [route]
                
                
        return(id) 

    def add_demand(self,dmnd): 
        
        demand = copy.copy(dmnd)
        id = len(self.Demand)
        id+=1
        demand.Id = id
    
        self.Demand.append(demand)
        return(id) 
    
    def add_path(self,P): 
        
        pth = copy.copy(P)
        id = len(self.Path)
        id+=1
        pth.Id = id
        
        self.Path.append(pth)
        return(id) 
        
    def add_subnet(self,S ):
        
        sbnet = copy.copy(S)
        self.Subnet.append(sbnet)
        return(sbnet.Id) 
            
    
    def add_adj_mtx(self,A):
        Adj = copy.copy(A)
        
        self.Adj_mtx.append(Adj)
        return(id) 
        
        
    def find_node(self,N,name = 0): 
   
        
        if name == 0: 
            for it in self.Node: 
                if it.Id == N: 
                    return (it) 
                
            return(0)
        else:
            for it in self.Node: 
                if it.Name == name: 
                    return (it) 
        
            return(0)
        

    
    def find_link(self,L,Desc = 0): 
     
        i = 0 
        if Desc == 0:
            for it in self.Link: 
                if it.Id == L: 
                    return(self.link[i]) 
                else: i +=1 
            return(0) 
        else:
            for it in self.Link: 
                if it.Desc == Desc: 
                    return (self.Link[i]) 
                else: i +=1 
            return(0)
        
    def find_route(self,NdeA,NdeZ): 
     
   
        for it in self.Route: 
            if it.NodeA == NdeA and it.NodeZ == NdeZ: 
                return (it) 
#             elif it.NodeA == NdeZ and it.NodeZ == NdeA:
#                 return (it)
#             
        return(0)  
    
    
    def find_path(self,P,Desc = 0): 
     
        i = 0 
        if Desc == 0:
            for it in self.Path: 
                if it.Id == P: 
                    return(self.Path[i]) 
                else: i +=1 
            return(0) 
        else:
            for it in self.Path: 
                if it.Desc == Desc: 
                    return (self.Path[i]) 
                else: i +=1 
            return(0)
            
    def find_subnet(self,id,Desc = False):
        

        if Desc:
            for it in self.Subnet:
                if it.Desc == Desc:
                    return(it)
        else:
            for it in self.Subnet:
                if it.Id == id:
                    return (it)
                
        return(0)
                
                
        
    def find_traffic(self,id):
        
        id = int(id)
       
        for it in self.Traffic:
            if it.Id == id:
                return (it)
                
        return(0)
                
                
        
    
        
       
        
  #======================================= Utility methods===========================================          
            
def print_mtx(Mtx,object = 0):
    
    row = Mtx.shape[0]
    col = Mtx.shape[1]
    print "Row = %i  Col = %i  Non Zeros  = %i" %(row,col,np.count_nonzero(Mtx))
    
    i = 0
    print "      ",
    while i < col:
        print "%3.2d" %i,
        i+=1
        
    i = 0
    print " \n      ",
    while i < col:
        print "---",
        i+=1
    
    i = 0
    j = 0
    while i < row:
        j=0
        print "\n%4.2i) " %i,
        while j < col:
            if object:
                if Mtx[i,j]:
                    
                    print "%3.2i" % len(Mtx[i,j]),
                else:
                    print "%3.2i" % int(Mtx[i,j]),
                    
            else:
                print "%3.2i" % int(Mtx[i,j]),
            j+=1
        i+=1
    print "\n"
    

def network_routing_cost(link):
    routing = "ospf" # future will have diferent cost metrics
    
#       OSPF uses a simple formula to calculate the OSPF cost for an interface with this formula
#       cost = reference bandwidth / interface bandwidth.
#       The reference bandwidth is a value in Mbps that we can set ourselves. By default this is 100Mbps 
    if routing == "ospf":
        reference_bandwidth = 1*10e9 # 1,000,000,000
        cost = reference_bandwidth / link.Capacity
       # print "Link Desc %s Capacity = %f  Cost = %f" %(link.Desc,link.Capacity,cost)
 
        if cost < 1:
            cost = 1
        
        return cost
    




def Get_nodes(Net,f):
    
    fname = DirName+"test\\"+f
    #Node    Y    X    Desc

    print "get_nodes"
    tmp = Node(0,"",0,0,0,"",0,"") 
    with open(fname, 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            if row[0][0] !="#": 
                tmp.Name = row[0]
                tmp.X = row[1]
                tmp.Y = row[2]
                tmp.Equip = row[3]
                tmp.Subnet = row[4]
                tmp.TZ = float(row[5])
                print tmp.TZ
                Net.add_node(tmp)
                
                
#         for it in Net.Node:
#             it.Print()

def Get_locations(Loc_List):
    
    fname = DirName+"uscities.csv"
    print "get_locations"
    tmp = Location("","","",0,0.0,0.0) 
    with open(fname, 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            if row[0][0] !="#": 
                tmp.Loc_code = row[0]
                tmp.Name = row[3]
                tmp.State = row[4]
                tmp.Lat = row[1]
                tmp.Long= row[2]
                tmp.Tz = row[5]
                loc = copy.copy(tmp)
                Loc_List.append(loc)
    
            
def Get_links(Net,f):
    
    fname = DirName+"test\\"+f
    #Node    Y    X    Desc

    print "get_links"
   
    tmp = Link(0,"","",0,0,0,0,0.0,0,"") 
    with open(fname, 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            if row[0][0] !="#": 
               
                tmp.Desc = row[2]
                tmp.PortA = row[4]
                tmp.PortZ = row[5]
                tmp.Capacity = float(row[3])
                tmp.Direction = int(row[6])
                tmp.Type = row[7]
                ta = Net.find_node(0,name = row[0])
               ##ta.Print()
                tz = Net.find_node(0,name = row[1])
              #  tz.Print()
                if ta and tz :
                    tmp.NodeA = ta
                    tmp.NodeZ = tz   
                    Net.add_link(tmp)         
#     for it in Net.Link:
#         it.Print()


def Get_paths(Net):
    
    fname = DirName+"standard\\paths_lsp.csv"
    #Node    Y    X    Desc

    print "get_paths"
    tNodeA = Node(0,"",0,0,0,"") 
    tNodeZ = Node(0,"",0,0,0,"") 
    
    current_pid = 0
    with open(fname, 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
          
           
            if len(row[0]):
            
                if row[0][0] !="#": 
                    tmp = Path(0,"","",0,0,"") 
                 
                    tmp.Desc = row[1]
                    ta = Net.find_node(0,name = row[2])
                    tz = Net.find_node(0,name = row[3])
                    tl = Net.find_link(0,Desc = row[4])
                    #tl.Print()
                    
                    tmp.Direction = row[5]
                    tmp.Type = row[6]
                  
                    if ta and tz and tl:
                        tmp.NodeA = ta
                        tmp.NodeZ = tz
                        tmp.Add_links(tl)
                        current_pid = Net.add_path(tmp)
                      
                        
            else:
                    print row[4]
                    tl = Net.find_link(0,Desc = row[4])
                    print "tl" ,tl
                    current_path = Net.find_path(current_pid)
                    
                    current_path.Add_links(tl)
#                        
#     for it in Net.Path:
#         it.Print()
#         
        
def Get_traffic(Net):
    fname = DirName+"standard\\traffic.csv"
    print "Get Traffic"
    i = 0
  
    id,t,value = np.loadtxt(fname, delimiter = ',',unpack= True)
    N = len(id)
    last = id[0]
  
    new_start = 0
    
    while i < N:
        count =0
       
        while  i < N and last == id[i]:
           
            count+=1
            i+=1
            
      
       
        try:
            last = id[i]
        
        except:
            IndexError
      
      

        Tarray = np.zeros([count,2])
        
        
       
        j = 0
        while j < count:
            Tarray[j,0] = t[j+new_start]
            Tarray[j,1] = value[j+new_start]
            j+=1
        new_start = new_start+count
        tmp = Traffic(0,Tarray)
       # tmp.Print()
        Net.add_traffic(tmp)
        i = new_start

     
       
#         
#     for it in Net.Traffic:
#         it.Print()       
#         

def Get_demands(Net,f):
    
    fname = DirName+"test\\" +f
    #Node    Y    X    Desc

    print "get_demands"
   
    tmp = Demand(0,"","",0,0,0,0) 
    with open(fname, 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            
            if row[0][0] !="#": 
               
                tmp.Desc = row[1]
                tmp.Type = row[2]
                ta = Net.find_node(0,name = row[3])
        
                tz = Net.find_node(0,name = row[4])
                tmp.Direction = row[5]
                Traffic_id = row[6]

                traf = Net.find_traffic(Traffic_id) 
              
                if ta and tz and traf :
                    tmp.NodeA = ta
                    tmp.NodeZ = tz 
                    tmp.Traffic = traf
                    Net.add_demand(tmp) 
                else:
                    "not found"   
                    
                    
def Get_subnets(Net):
    
    def add_parents():
        for it in Net.Subnet:
            if it.Parentid or not it.Parentid == "None":
                sb = Net.find_subnet(it.Parentid)
                if sb:
                    it.add_parents(sb)
                    


    fname = DirName+"\standard\\subnet.csv"
    #Node    Y    X    Desc

    print "get_subnet"
    tmp = Subnet(0,"",0,0,"",0,0) 
    with open(fname, 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            if row[0][0] !="#":
                tmp.Id = row[0] 
                tmp.Name = row[1]
                tmp.X = row[3]
                tmp.Y = row[4]
                tmp.Parentid = row[2]    
                Net.add_subnet(tmp)
        add_parents()
#         for it in Net.Subnet:
#             it.Print()
#  
#================================= Key Routines ========================================================        
        
        
def Make_networkX(Net,G,D = 0):
    
    
    pos= {}
    i = 0
    while i < len(Net.Node):
        tmp = (Net.Node[i].X,Net.Node[i].Y)
        pos[Net.Node[i].Name] = tmp
        G.add_node(Net.Node[i].Name)
        i+=1

    i =0
    if D:
        print D.Desc
        while i < len(D.Route[0].Links):
            print i, D.Route[0].Links[i].NodeA.Name
            G.add_edge(D.Route[0].Links[i].NodeA.Name, D.Route[0].Links[i].NodeZ.Name)
            i+=1
        
    else:
        
        while i < len(Net.Link):
            G.add_edge(Net.Link[i].NodeA.Name, Net.Link[i].NodeZ.Name)
            i+=1
        
    return G,pos
    
      
def Graph_networkX(G,pos,fname): 
    
    fname = DirName+fname
    print "fname = ",fname 
    plt.figure(1,figsize = (12,12))
    #plt.clf()

    

    nx.draw_networkx(G,pos,node_color = 'yellow', node_size = 800)
    #nx.draw_networkx(G,pos=pos_s,node_color = 'yellow', node_size = 800,scale =100)
    plt.savefig(fname)

def Read_data(Net,Location_list):
    
    Get_nodes(Net,"nodebox.csv")
    Get_links(Net,"linkbox.csv") 
    #Get_paths(Net)
    Get_traffic(Net)

    Get_demands(Net,"demandbox.csv")
    Get_subnets(Net)
    Get_locations(Location_list)
    
#     
def Create_route_table(Net):
    
    N = len(Net.Node)+1
    
    Rt_Tbl = np.zeros([N,N], dtype = object)
    
    def get_dim(dim,index):
        row = index/dim
        col = index % dim
        return(row,col)
 
    
    def make_route(ndeA,ndeZ,rtA,rtZ,typ):

        def check_for_dup(tmp):
            rt = Net.find_route()
            if rt:
                N= len(rt.Links)
                j = 0
                while j < N:
                    if rt.Links[j].Id != tmp.Links[j].Id:
                        return(False)
            else:
                j+=1
        return True
              
          
        desc = ndeA.Name +"-->"+ndeZ.Name
        cost1 = rtA.Value
        cost2 = rtZ.Value
        if cost1 >= cost2:
            cost = cost1
        else:
            cost = cost2
        new_hops = rtA.Hops+rtZ.Hops +1
       
        tmp = Route(0,desc,typ,ndeA,ndeZ,1,new_hops,cost,0.0,0.0)
        new_links = rtA.Links +rtZ.Links
        tmp.Links = new_links
        OK = check_for_dup(tmp)
        if not OK:
            Net.add_route(tmp,Rt_Tbl)
     
        
    def make_direct_routes():
        for it in Net.Link:
            cost = float(network_routing_cost(it))
            print "Link Desc %s COst = %f" %(it.Desc,cost)
            desc = it.NodeA.Name +"-->"+it.NodeZ.Name
           
            tmp = Route(0,desc,"Direct",it.NodeA,it.NodeZ,it.Direction,0,cost,0.0,0.0)
            
            tmp.add_links(it)
            Net.add_route(tmp,Rt_Tbl)
         
            
    def create_adj_mtx():
        
        
        mtx = np.zeros([N+1,N+1])
        np.fill_diagonal(mtx, 1)
        desc = "Direct" 
        hops = 0
        
        
        tmp = Adj_mtx (mtx,desc,hops)
        for it in Net.Link:
            
            tmp.Mtx[it.NodeA.Id][it.NodeZ.Id] = 1
            
            if not it.Direction:
             
                 tmp.Mtx[it.NodeZ.Id][it.NodeA.Id] = 1
                 
                 
        Net.add_adj_mtx(tmp)
        
        mtx_count = np.count_nonzero(Net.Adj_mtx[0].Mtx)
        #print "count =",mtx_count
        new_count = 0
        i = 0
        while mtx_count != new_count:
            new_mtx  = np.dot(Net.Adj_mtx[0].Mtx,Net.Adj_mtx[i].Mtx)
            
            desc = str(i+1)+" Hop" 
            hops = i+1
            tmp = Adj_mtx (new_mtx,desc,hops)
            tmpa = copy.copy(tmp)
            Net.add_adj_mtx(tmpa)
            mtx_count = np.count_nonzero(Net.Adj_mtx[i].Mtx)
            new_count = np.count_nonzero(Net.Adj_mtx[i+1].Mtx)
            print "count =",new_count," hops = ",hops
            print_mtx(Net.Adj_mtx[i].Mtx)
            
            i+=1
        Net.Adj_mtx.pop()
        print "adj mtx # = ",len(Net.Adj_mtx)
#         
#         for it in Net.Adj_mtx:
#             it.Print(1)
            
    def fill_route_table():
         
        dim = Net.Adj_mtx[0].Mtx.shape[0]
         
        def iterate(start,end):
           # print "iterate",start,end
           # transpose = np.transpose(Net.Adj_mtx[start].Mtx)
            #print_mtx(transpose)
            
            it = np.nditer((Net.Adj_mtx[start].Mtx,Net.Adj_mtx[end].Mtx),flags =['c_index'])
           # it = np.nditer((Net.Adj_mtx[start].Mtx,transpose),flags =['c_index'])
            while not it.finished:
                if it[0] == 0 and it[1] != 0:
                    
                    r,c = get_dim(dim, it.index)
                 #   print "row = %i Col = %i index = %i" %(r,c,it.index)
                    
                    
                    i = 0
                    while i < dim:
      
                        if Net.Adj_mtx[start].Mtx[r,i] > 0 and Net.Adj_mtx[start].Mtx[i,c] > 0:
    #                                
                            if r != c: 
                                
#                                 if r == 1:
#                                     print "--+++++++++++ start = ",start, "--end = ",end
#                                     print " r = ",r," i = ",i,"|",Net.Adj_mtx[start].Mtx[r,i]
#                                     print " i = ",i," c = ",c, "|",Net.Adj_mtx[end].Mtx[i,c]
#                                     Nr    = Net.Node[i-1]                        
#                                     Na    = Net.Node[r-1]
#                                     Nz    = Net.Node[c-1]
#                                     ra = Net.find_route(Na,Nr)
#                                     rz = Net.find_route(Nr,Nz)
#                                     ra.Print()
#                                     rz.Print()
                                    
#                                
                                NodeAr = Net.find_node(i)
                                Nr    = Net.Node[i-1]
                                NodeA  =  Net.find_node(r)
                                Na    = Net.Node[r-1]
                                NodeZ = Net.find_node(c)
                                Nz    = Net.Node[c-1]
#                                 print "Ar ",NodeAr.Name ," id = ",NodeAr.Id
#                                 print Nr.Name ,"Tuple  id = ",Nr.Id
#                                 print "----------------"
#                                 print "A", NodeA.Name ," id = ",NodeA.Id
#                                 print Na.Name ," Tuple id = ",Na.Id
#                                 print "----------------"
#                                 print "Z",NodeZ.Name ," id = ",NodeZ.Id
#                                 print Nz.Name ," Tuple id = ",Nz.Id
#                                 print "----------------"
# #                         
                                rta = Net.find_route(NodeA,NodeAr)
                                rtz = Net.find_route(NodeAr,NodeZ)
#                                 print rta.Desc
#                                 print rtz.Desc
                                
                                if rta and rtz:
  #                                  print "Making Route"
                                    make_route(NodeA,NodeZ,rta,rtz,"via")
                        i+=1
                it.iternext()
                
        i = 0
        N = len(Net.Adj_mtx)
        while i+1 < N:
            iterate(i,i+1)
            i+=1
                        
#=============Main routine for  Create_route_table    
            
    make_direct_routes()
   # print_mtx(Rt_Tbl,1)
    create_adj_mtx()
    fill_route_table()
    #print_mtx(Rt_Tbl,1)
    return Rt_Tbl
    
#     for it in Net.Route:
#         it.Print()
def Satisfy_demands(Net,Rt_tbl):   
    
    def Get_timeline():
        
        Max_time = 0
        Max_item = 0
        for it in Net.Demand:
            Total,Max,Avg,End_time,items = it.Summary()
            if End_time > Max_time:
                Max_time = End_time
            if items > Max_item:
                Max_item = items
                
        # Time Zone
        MinTz = Net.Node[1].TZ
        MaxTz =  Net.Node[1].TZ
        for it in Net.Node:
            if MinTz > it.TZ:
                MinTz= it.TZ
            if MaxTz < it.TZ:
                MaxTz= it.TZ
                
       
    
        #print "Max Time = %f, Max Item = %f, MaxTz = %f, MinTz = %f" %(Max_time,Max_item,MaxTz,MinTz)
        #print Max_time/(Max_item-1)
        
        if (Max_time/(Max_item-1)) == 3600:
            units = "HR"
        else:
            print "Units in traffic do not match: was expecting 3600 second in each bin"
            
        if units == "HR":
            
            if MaxTz > 0 and MinTz > 0:
                Timeline = Max_item + MaxTz - MinTz
            if MaxTz < 0 and MinTz < 0:
                Timeline = Max_item +  abs(MinTz)- abs(MaxTz)
            if MaxTz > 0 and MinTz < 0:
                Timeline = Max_item + MaxTz + abs(MinTz)
            
        print "Timeline = ", Timeline
        
        return Timeline,MinTz

            
            
    def update_route(rt,dmd,MinTz,OK):  
        if OK: # Demand satisfied
           
            end = dmd.Traffic.Traffic_rate.shape[0]
            dmd.Route.append(rt)
            for lnk in rt.Links:
                
                i = 0
                while i < end:
                   # print  i ,i+MinTz, dmd.Traffic.Traffic_rate[i,1]+lnk.Traffic_pattern[i,1], lnk.Id
                    
                    lnk.Traffic_pattern[i,0] = i+MinTz 
                    lnk.Traffic_pattern[i,1] =  dmd.Traffic.Traffic_rate[i,1]+lnk.Traffic_pattern[i,1]
                   
                    i+=1
                #lnk.Graph_it()
            
               
                
      


    NDemands = len(Net.Demand)
    
    timeline,MinTz = Get_timeline()
    # create traffic timeline for Traffic pattern on each Link
    Traffic_pattern = np.zeros([timeline,2])
    #initialize Traffic Pattern
    
    i = 0
    while i < timeline:
        Traffic_pattern[i,0] = i + MinTz
        i+=1
    #initialize Link traffic pattern
    # create empty Traffic patterns for each link
    for it in Net.Link:
        it.Traffic_pattern = copy.copy(Traffic_pattern)
        
   
    
    for it in Net.Demand:
        mx_demand = it.Max_traffic()
        Aid = it.NodeA.Id
        Zid = it.NodeZ.Id
        
        print "--------------- ",it.Desc
        rlist = Rt_tbl[Aid,Zid]
        
        N = len(rlist)
        i = 0
        Done = False
        while i < N and not Done:
            if mx_demand > rlist[i].Capacity - rlist[i].Current:
                Done = True
                update_route(rlist[i],it,MinTz,Done)
                
            i+=1
        if not Done:
             print "not sufficient capacity" 
             update_route(rlist[i],it,MinTz,Done)
             
            
                
                
   
            
            
    print "timeline  Min time", timeline,MinTz
    
    
def View_route_entry(RT,Aid,Zid):
    
    
    
    rlist = RT[Aid][Zid]
    for rt in rlist:
        rt.Print()
        
    
    
def Examine_route_table(Rt):
    
    row = Rt.shape[0]
    col = Rt.shape[1]
    print "Row = %i  Col = %i  Non Zeros  = %i" %(row,col,np.count_nonzero(Rt))

    i = 0
    j = 0
    while i < row:
        j=0
        print "\n%4.2i) " %i,
        while j < col:
            #print i,j
            if Rt[i,j]:
                    
                print " Row = %i Col = %i Value Len %3.2i" % (i,j,len(Rt[i,j]))
            j+=1
        
                
        i+=1
        
        
def Remove_duplicate_route(Net):
    
    def check_links(k):
        N = len(Net.Route[k].Links)
        if  N == len(Net.Route[k+1].Links):
            j = 0
            while j < N:
                if Net.Route[k].Links[j].Id != Net.Route[k+1].Links[j].Id:
                
                    
                    return(False)
                else:
                    j+=1
                    
        else:
            return(False)
        
        return (True)
                
            
    
   
    
    Net.Route.sort(key = lambda x: (x.NodeA.Id,x.NodeZ.Id,x.Value))
    del_list = []
    
    N = len(Net.Route)
    i = 0
    while i < N-1:
        if Net.Route[i].NodeA.Id == Net.Route[i+1].NodeA.Id and Net.Route[i].NodeZ.Id == Net.Route[i+1].NodeZ.Id:
            OK =  check_links(i)
            if OK:
                del_list.append(i+1)
          
            print "+++++++++++++++++++++++++++++"
            print i ,OK, Net.Route[i].Desc,Net.Route[i+1].Desc
            for it in Net.Route[i].Links:
                print it.NodeA.Id, it.NodeZ.Id
                print "-------"
            for it in Net.Route[i+1].Links:
                print it.NodeA.Id, it.NodeZ.Id
        i+=1
    print "del list = ",del_list

        
            
            
            
        
        
            
    
          

if __name__ == '__main__':
    
    G = nx.Graph()
    Loc_List = []
    
    
   
    Id = 1
    Name = "Test"
    Desc = "Test Csv Network"
    
    Net = Network(Id,Name,Desc)
    
    Read_data(Net,Loc_List)
    
    G, Pos = Make_networkX(Net,G)
    Graph_networkX(G,Pos,"net-box")

    Route_table = Create_route_table(Net)
#     print "--------------- Route Table ----------"
#     print_mtx(Route_table,1)
#     
    Satisfy_demands(Net,Route_table)
    Aid = 1
    Zid = 6
    View_route_entry(Route_table,Aid,Zid)
    Aid = 6
    Zid = 1
    View_route_entry(Route_table,Aid,Zid)
    
    Remove_duplicate_route(Net)
    
    
   #Examine_route_table(Route_table)
    #for dmd in Net.Demand:
#     dmd = Net.Demand[0]
#     G, Pos = Make_networkX(Net, G, dmd)
# #         F = dmd.Desc
# #         print F
#     F = str(dmd.Id)
#     DName = 'C:\Users\mel\Documents\Python_Scripts\\'
#     fname = DName+"\Demand"+dmd.NodeA.Name+"-->"+dmd.NodeZ.Name
# 
#     Graph_networkX(G,Pos,fname)
#         
#     