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
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
        throw new Error("No results found for the specified city.");
      }
      const { latitude, longitude } = data.results[0];
      if (typeof latitude !== "number" || typeof longitude !== "number") {
        throw new Error("Invalid latitude or longitude in geocoding response.");
      }
      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,apparent_temperature,rain&timezone=Europe%2FBerlin`);
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status} ${weatherResponse.statusText}`);
      }
      const weatherData = await weatherResponse.json();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(weatherData, null, 2),
          }
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving weather data: ${error instanceof Error ? error.message : String(error)}`,
          }
        ],
        isError: true,
      };
    }
  }
)


const transport= new StdioServerTransport();
// Start the server
server.connect(transport)

//Funciona a 7 d'Agost de 2025