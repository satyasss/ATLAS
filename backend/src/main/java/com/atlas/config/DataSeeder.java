package com.atlas.config;

import com.atlas.model.Product;
import com.atlas.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) return;

        String[][] data = {
            // {name, description, price, imageUrl, sector, stock}
            {"Drip Irrigation Kit","Complete drip system for 1 acre","4500","https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400","agri","50"},
            {"Tractor Spare Parts","Engine & transmission parts","12000","https://images.unsplash.com/photo-1592878849122-facb97ed2eab?w=400","agri","30"},
            {"Organic Fertilizer 50kg","Bio-certified compost fertilizer","1200","https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400","agri","200"},
            {"Sprayer Pump","Battery-operated 16L sprayer","2800","https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400","agri","75"},

            {"Fish Feed 25kg","High-protein pellet fish feed","1800","https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400","aqua","100"},
            {"Aerator Pump","Solar-powered pond aerator","6500","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400","aqua","40"},
            {"Fishing Net 50m","Premium nylon mesh fishing net","3200","https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400","aqua","60"},
            {"Water Quality Tester","Digital pH & O2 meter","2200","https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=400","aqua","80"},

            {"MCB 32A","Miniature circuit breaker","450","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400","electrical","300"},
            {"Cable 4mm x 100m","Copper armoured cable","8500","https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400","electrical","50"},
            {"LED Flood Light 100W","Outdoor waterproof flood light","1600","https://images.unsplash.com/photo-1518770660439-4636190af475?w=400","electrical","150"},
            {"Distribution Box 8-way","MS powder-coated DB box","2400","https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400","electrical","70"},

            {"Arduino Mega","Microcontroller development board","950","https://images.unsplash.com/photo-1518770660439-4636190af475?w=400","electronics","200"},
            {"CCTV Camera 4MP","IP66 outdoor dome camera","2800","https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400","electronics","90"},
            {"Raspberry Pi 4","4GB RAM single-board computer","5500","https://images.unsplash.com/photo-1518770660439-4636190af475?w=400","electronics","45"},
            {"Solar Charge Controller","MPPT 40A controller","3200","https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400","electronics","60"},

            {"Drill Machine 13mm","Variable speed reversible drill","3500","https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400","mechanical","80"},
            {"Angle Grinder 4.5\"","900W heavy-duty grinder","2800","https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400","mechanical","65"},
            {"Hydraulic Jack 3T","Floor jack for vehicles","4200","https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400","mechanical","40"},
            {"Bearing Set SKF","Industrial ball bearing assorted","1800","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400","mechanical","120"},

            {"TMT Steel Bars 12mm","Fe-500 grade 12m bars (per piece)","720","https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400","civil","500"},
            {"Portland Cement 50kg","OPC 53 grade cement bag","380","https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=400","civil","1000"},
            {"Waterproofing Compound","Dr Fixit 1L crystalline WP","650","https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=400","civil","300"},
            {"Plywood 18mm 8x4","BWP grade commercial ply","2800","https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400","civil","200"},

            {"Lab Glass Beakers Set","Borosilicate 100ml-1000ml set","1200","https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400","chemical","150"},
            {"pH Buffer Solution","pH 4,7,10 calibration kit","480","https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400","chemical","200"},
            {"Industrial Gloves","Chemical-resistant nitrile gloves (pair)","180","https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400","chemical","500"},
            {"Titration Burette 50ml","Borosilicate glass precision burette","850","https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400","chemical","100"},

            {"Rice 25kg Premium","Sona Masoori raw rice","1450","https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400","food","300"},
            {"Cold Press Coconut Oil 1L","Virgin organic coconut oil","680","https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=400","food","400"},
            {"Spice Mix Pack","Masala assorted 12-pack","960","https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400","food","250"},
            {"Dry Fruits Box 1kg","Premium mixed dry fruits","1800","https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400","food","180"},

            {"Nano Silver Solution","Antimicrobial 100ppm solution","2200","https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400","nanobio","80"},
            {"Bioreactor 5L","Bench-top stirred tank bioreactor","85000","https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400","nanobio","5"},
            {"DNA Extraction Kit","Plant & animal tissue 50-preps","4500","https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400","nanobio","60"},
            {"Micropipette 1000ul","Single channel adjustable pipette","6800","https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400","nanobio","40"},
        };

        for (String[] d : data) {
            Product p = new Product();
            p.setName(d[0]);
            p.setDescription(d[1]);
            p.setPrice(Double.parseDouble(d[2]));
            p.setImageUrl(d[3]);
            p.setSector(d[4]);
            p.setStock(Integer.parseInt(d[5]));
            productRepository.save(p);
        }
        System.out.println("✅ Sample products seeded.");
    }
}
