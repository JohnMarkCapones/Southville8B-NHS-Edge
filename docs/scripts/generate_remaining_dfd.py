#!/usr/bin/env python3
"""
Generate remaining Super Admin DFDs
"""

dfds = [
    ("News", "Web-SuperAdmin-News-DFD", "news", [
        ("D1", "News", "news"),
        ("D2", "Users", "users"),
    ]),
    ("Announcements", "Web-SuperAdmin-Announcements-DFD", "announcements", [
        ("D1", "Announcements", "announcements"),
        ("D2", "Banners", "banner_notifications"),
    ]),
    ("Events", "Web-SuperAdmin-Events-DFD", "events", [
        ("D1", "Events", "events"),
        ("D2", "Users", "users"),
    ]),
    ("Clubs", "Web-SuperAdmin-Clubs-DFD", "clubs", [
        ("D1", "Clubs", "clubs"),
        ("D2", "Users", "users"),
    ]),
    ("Gallery", "Web-SuperAdmin-Gallery-DFD", "gallery", [
        ("D1", "Gallery", "gallery"),
    ]),
    ("Static Pages", "Web-SuperAdmin-Static-Pages-DFD", "static-pages", [
        ("D1", "Static Pages", "static_pages"),
    ]),
    ("Resources", "Web-SuperAdmin-Resources-DFD", "resources", [
        ("D1", "Resources", "resources"),
    ]),
    ("Subjects", "Web-SuperAdmin-Subjects-DFD", "subjects", [
        ("D1", "Subjects", "subjects"),
        ("D2", "Teachers", "teachers"),
    ]),
    ("Classes", "Web-SuperAdmin-Classes-DFD", "classes", [
        ("D1", "Classes", "classes"),
        ("D2", "Sections", "sections"),
    ]),
    ("Learning Materials", "Web-SuperAdmin-Learning-Materials-DFD", "learning-materials", [
        ("D1", "Learning Materials", "learning_materials"),
        ("D2", "Subjects", "subjects"),
    ]),
    ("Top Performers", "Web-SuperAdmin-Top-Performers-DFD", "top-performers", [
        ("D1", "Students", "students"),
        ("D2", "Grades", "grades"),
    ]),
    ("Academic Calendar", "Web-SuperAdmin-Academic-Calendar-DFD", "academic-calendar", [
        ("D1", "Academic Calendar", "academic_calendar"),
    ]),
    ("Schedule Management", "Web-SuperAdmin-Schedule-DFD", "schedule", [
        ("D1", "Schedules", "schedules"),
        ("D2", "Subjects", "subjects"),
        ("D3", "Teachers", "teachers"),
        ("D4", "Sections", "sections"),
    ]),
    ("Schedule Wizard", "Web-SuperAdmin-Schedule-Wizard-DFD", "schedule-wizard", [
        ("D1", "Schedules", "schedules"),
        ("D2", "Subjects", "subjects"),
        ("D3", "Teachers", "teachers"),
        ("D4", "Sections", "sections"),
    ]),
    ("Timetable", "Web-SuperAdmin-Timetable-DFD", "timetable", [
        ("D1", "Schedules", "schedules"),
        ("D2", "Sections", "sections"),
    ]),
    ("Assignments", "Web-SuperAdmin-Assignments-DFD", "assignments", [
        ("D1", "Assignments", "assignments"),
        ("D2", "Subjects", "subjects"),
    ]),
    ("System Settings", "Web-SuperAdmin-System-Settings-DFD", "system-settings", [
        ("D1", "System Config", "system_config"),
    ]),
]

def generate_dfd(name, dfd_id, id_suffix, data_stores):
    stores_xml = ""
    query_branches = ""
    data_branches = ""
    
    store_y_positions = []
    for i, (store_id, store_name, table_name) in enumerate(data_stores):
        y_pos = 180 + (i * 70)
        store_y_positions.append((y_pos, store_id))
        stores_xml += f'''        <mxCell id="web-superadmin-{id_suffix}-{store_id.lower()}" value="{store_id}&lt;br&gt;{store_name}&lt;br&gt;({table_name})" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#f8cecc;strokeColor=#b85450;fontSize=9;" parent="1" vertex="1">
          <mxGeometry x="680" y="{y_pos}" width="80" height="50" as="geometry" />
        </mxCell>
'''
    
    # Query flows
    if len(store_y_positions) > 0:
        first_y = store_y_positions[0][0] + 25
        query_branches += f'''        <mxCell id="web-superadmin-{id_suffix}-db-f1" value="" style="endArrow=classic;html=1;rounded=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;exitX=1;exitY=0.5;exitDx=0;exitDy=0;" edge="1" parent="1" source="web-superadmin-{id_suffix}-api" target="web-superadmin-{id_suffix}-{store_y_positions[0][1].lower()}" edge="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="600" y="275" as="sourcePoint" />
            <mxPoint x="680" y="{first_y}" as="targetPoint" />
            <Array as="points">
              <mxPoint x="650" y="275" />
              <mxPoint x="650" y="150" />
              <mxPoint x="650" y="{first_y}" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="web-superadmin-{id_suffix}-db-f1-label" value="Query" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=7;" vertex="1" connectable="0" parent="web-superadmin-{id_suffix}-db-f1">
          <mxGeometry x="-0.4993" y="1" relative="1" as="geometry">
            <mxPoint x="32" y="4" as="offset" />
          </mxGeometry>
        </mxCell>
'''
        for y_pos, store_id in store_y_positions[1:]:
            center_y = y_pos + 25
            query_branches += f'''        <mxCell id="web-superadmin-{id_suffix}-db-f1-{store_id.lower()}" value="" style="endArrow=classic;html=1;rounded=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;exitX=1;exitY=0.5;exitDx=0;exitDy=0;" edge="1" parent="1" source="web-superadmin-{id_suffix}-api" target="web-superadmin-{id_suffix}-{store_id.lower()}" edge="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="600" y="275" as="sourcePoint" />
            <mxPoint x="680" y="{center_y}" as="targetPoint" />
            <Array as="points">
              <mxPoint x="650" y="275" />
              <mxPoint x="650" y="{center_y}" />
            </Array>
          </mxGeometry>
        </mxCell>
'''
        
        # Data flows
        first_y = store_y_positions[0][0] + 25
        data_branches += f'''        <mxCell id="web-superadmin-{id_suffix}-db-f2" value="" style="endArrow=classic;html=1;rounded=0;exitX=0.75;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" edge="1" parent="1" source="web-superadmin-{id_suffix}-{store_y_positions[0][1].lower()}" target="web-superadmin-{id_suffix}-api" edge="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="620" y="{first_y}" as="sourcePoint" />
            <mxPoint x="500" y="275" as="targetPoint" />
            <Array as="points">
              <mxPoint x="575" y="{first_y}" />
              <mxPoint x="575" y="150" />
              <mxPoint x="450" y="150" />
              <mxPoint x="450" y="275" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="web-superadmin-{id_suffix}-db-f2-label" value="Data" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" vertex="1" connectable="0" parent="web-superadmin-{id_suffix}-db-f2">
          <mxGeometry x="-0.0593" y="1" relative="1" as="geometry">
            <mxPoint as="offset" />
          </mxGeometry>
        </mxCell>
'''
        for y_pos, store_id in store_y_positions[1:]:
            center_y = y_pos + 25
            if center_y == 275:
                data_branches += f'''        <mxCell id="web-superadmin-{id_suffix}-db-f2-{store_id.lower()}" value="" style="endArrow=classic;html=1;rounded=0;exitX=0.75;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" edge="1" parent="1" source="web-superadmin-{id_suffix}-{store_id.lower()}" target="web-superadmin-{id_suffix}-api" edge="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="620" y="{center_y}" as="sourcePoint" />
            <mxPoint x="500" y="275" as="targetPoint" />
            <Array as="points">
              <mxPoint x="575" y="{center_y}" />
              <mxPoint x="450" y="{center_y}" />
            </Array>
          </mxGeometry>
        </mxCell>
'''
            else:
                data_branches += f'''        <mxCell id="web-superadmin-{id_suffix}-db-f2-{store_id.lower()}" value="" style="endArrow=classic;html=1;rounded=0;exitX=0.75;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;" edge="1" parent="1" source="web-superadmin-{id_suffix}-{store_id.lower()}" target="web-superadmin-{id_suffix}-api" edge="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="620" y="{center_y}" as="sourcePoint" />
            <mxPoint x="500" y="275" as="targetPoint" />
            <Array as="points">
              <mxPoint x="575" y="{center_y}" />
              <mxPoint x="450" y="{center_y}" />
              <mxPoint x="450" y="275" />
            </Array>
          </mxGeometry>
        </mxCell>
'''
    
    return f'''  <diagram name="Web App - Super Admin {name} DFD" id="{dfd_id}">
    <mxGraphModel dx="1310" dy="940" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="web-superadmin-{id_suffix}-admin" value="&lt;font style=&quot;font-size: 14px;&quot;&gt;&lt;i&gt;Super Admin&lt;/i&gt;&lt;/font&gt;" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" parent="1" vertex="1">
          <mxGeometry x="30" y="250" width="100" height="50" as="geometry" />
        </mxCell>
        <mxCell id="web-superadmin-{id_suffix}-p1.0" value="1.0&lt;br&gt;{name} Request" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" parent="1" vertex="1">
          <mxGeometry x="200" y="180" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="web-superadmin-{id_suffix}-p1.1" value="1.1&lt;br&gt;Load Data" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" parent="1" vertex="1">
          <mxGeometry x="200" y="260" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="web-superadmin-{id_suffix}-p1.2" value="1.2&lt;br&gt;Display {name}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" parent="1" vertex="1">
          <mxGeometry x="200" y="340" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="web-superadmin-{id_suffix}-api" value="&lt;font style=&quot;font-size: 14px;&quot;&gt;&lt;i&gt;Backend API&lt;/i&gt;&lt;/font&gt;" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" parent="1" vertex="1">
          <mxGeometry x="500" y="250" width="100" height="50" as="geometry" />
        </mxCell>
{stores_xml}        <mxCell id="web-superadmin-{id_suffix}-f1" value="Request" style="endArrow=classic;html=1;rounded=0;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;fontSize=9;" parent="1" source="web-superadmin-{id_suffix}-admin" target="web-superadmin-{id_suffix}-p1.0" edge="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="130" y="275" as="sourcePoint" />
            <mxPoint x="200" y="210" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="web-superadmin-{id_suffix}-f2" value="Request" style="endArrow=classic;html=1;rounded=0;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;fontSize=9;" parent="1" source="web-superadmin-{id_suffix}-p1.0" target="web-superadmin-{id_suffix}-p1.1" edge="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="260" y="240" as="sourcePoint" />
            <mxPoint x="260" y="260" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="web-superadmin-{id_suffix}-f3" value="HTTP GET" style="endArrow=classic;html=1;rounded=0;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;fontSize=9;" parent="1" source="web-superadmin-{id_suffix}-p1.1" target="web-superadmin-{id_suffix}-api" edge="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="320" y="290" as="sourcePoint" />
            <mxPoint x="500" y="275" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="web-superadmin-{id_suffix}-f4" value="Response" style="endArrow=classic;html=1;rounded=0;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;fontSize=9;" parent="1" source="web-superadmin-{id_suffix}-api" target="web-superadmin-{id_suffix}-p1.1" edge="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="500" y="275" as="sourcePoint" />
            <mxPoint x="320" y="290" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="web-superadmin-{id_suffix}-f5" value="Data" style="endArrow=classic;html=1;rounded=0;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;fontSize=9;" parent="1" source="web-superadmin-{id_suffix}-p1.1" target="web-superadmin-{id_suffix}-p1.2" edge="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="260" y="320" as="sourcePoint" />
            <mxPoint x="260" y="340" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="web-superadmin-{id_suffix}-f6" value="Display" style="endArrow=classic;html=1;rounded=0;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;fontSize=9;" parent="1" source="web-superadmin-{id_suffix}-p1.2" target="web-superadmin-{id_suffix}-admin" edge="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="200" y="370" as="sourcePoint" />
            <mxPoint x="130" y="275" as="targetPoint" />
            <Array as="points">
              <mxPoint x="180" y="370" />
              <mxPoint x="180" y="275" />
            </Array>
          </mxGeometry>
        </mxCell>
{query_branches}{data_branches}      </root>
    </mxGraphModel>
  </diagram>
'''

all_dfd_xml = []
for name, dfd_id, id_suffix, stores in dfds:
    dfd_xml = generate_dfd(name, dfd_id, id_suffix, stores)
    all_dfd_xml.append(dfd_xml)

with open("remaining_dfd_output.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(all_dfd_xml))

print(f"Generated {len(all_dfd_xml)} remaining Super Admin DFDs")

