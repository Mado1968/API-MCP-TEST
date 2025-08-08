import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server instancia
const server = new McpServer({
  name: "cescmcp",
  description: "MCP Server for Cesc",

  version: "1.0.0"
});

// Add an addition tool
server.tool(
   "Recupera_dades",
   "Recupera dades de api",
   {
    city : z.string().describe("City to retrieve data for"),
   },
   // Falta configurar i definir les respostes en cas de ERROR
   async ({city}) => {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
    const data= await response.json();
    const { latitude, longitude } = data.results[0];
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,apparent_temperature,rain&timezone=Europe%2FBerlin`);
    const weatherData = await weatherResponse.json();
            return{
            content:[
                     {
                     type: "text",
                     text: JSON.stringify(weatherData, null, 2),
                }
                    ],
                     
                     }
                        }
)


const transport= new StdioServerTransport();
// Start the server
server.connect(transport)

//Funciona a 7 d'Agost de 2025