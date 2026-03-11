import { PrismaClient } from '@prisma/client';
import { generateClientId } from '../../utils/clientIdGenerator';

const prisma = new PrismaClient();

export class ClientService {
  async getAllClients() {
    try {
      const clients = await prisma.client.findMany({
        select: {
          id: true,
          clientId: true,
          name: true,
          alias: true,
          address: true,
          pin: true,
          state: true,
          country: true,
          gstStatus: true,
          gstin: true,
          pan: true,
          _count: {
            select: {
              projects: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return clients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  async getClientById(id: string) {
    try {
      const client = await prisma.client.findUnique({
        where: { id },
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      });

      return client;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  }

  async createClient(clientData: any) {
    try {
      // Generate unique client ID if not provided
      const clientId = clientData.clientId || generateClientId();

      // Check if clientId already exists
      const existingClient = await prisma.client.findUnique({
        where: { clientId }
      });

      if (existingClient) {
        throw new Error('Client ID already exists');
      }

      // Validate GSTIN format if GST status is Yes
      if (clientData.gstStatus === 'Yes' && !clientData.gstin) {
        throw new Error('GSTIN is required for GST registered clients');
      }

      // Validate GSTIN format
      if (clientData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}Z$/.test(clientData.gstin)) {
        throw new Error('Invalid GSTIN format');
      }

      // Validate PAN format
      if (clientData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clientData.pan.toUpperCase())) {
        throw new Error('Invalid PAN format');
      }

      // Validate PIN code format
      if (clientData.pin && !/^[0-9]{6}$/.test(clientData.pin)) {
        throw new Error('PIN code must be 6 digits');
      }

      const client = await prisma.client.create({
        data: {
          clientId,
          name: clientData.name,
          alias: clientData.alias,
          address: clientData.address || null,
          pin: clientData.pin || null,
          state: clientData.state || null,
          country: clientData.country || null,
          gstStatus: clientData.gstStatus,
          gstin: clientData.gstin || null,
          pan: clientData.pan.toUpperCase()
        }
      });

      return client;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async updateClient(id: string, clientData: any) {
    try {
      // Validate GSTIN format if GST status is Yes
      if (clientData.gstStatus === 'Yes' && !clientData.gstin) {
        throw new Error('GSTIN is required for GST registered clients');
      }

      // Validate GSTIN format
      if (clientData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}Z$/.test(clientData.gstin)) {
        throw new Error('Invalid GSTIN format');
      }

      // Validate PAN format
      if (clientData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clientData.pan.toUpperCase())) {
        throw new Error('Invalid PAN format');
      }

      // Validate PIN code format
      if (clientData.pin && !/^[0-9]{6}$/.test(clientData.pin)) {
        throw new Error('PIN code must be 6 digits');
      }

      const client = await prisma.client.update({
        where: { id },
        data: {
          name: clientData.name,
          alias: clientData.alias,
          address: clientData.address || null,
          pin: clientData.pin || null,
          state: clientData.state || null,
          country: clientData.country || null,
          gstStatus: clientData.gstStatus,
          gstin: clientData.gstin || null,
          pan: clientData.pan.toUpperCase()
        }
      });

      return client;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  async deleteClient(id: string) {
    try {
      // Check if client has associated projects
      const projectCount = await prisma.project.count({
        where: { clientId: id }
      });

      if (projectCount > 0) {
        throw new Error(`Cannot delete client with ${projectCount} associated projects`);
      }

      await prisma.client.delete({
        where: { id }
      });

      return { message: 'Client deleted successfully' };
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  async bulkCreateClients(clientsData: any[]) {
    try {
      const results: {
        success: Array<{ row: number; clientId: string; name: string }>;
        errors: Array<{ row: number; data: any; error: string }>;
      } = {
        success: [],
        errors: []
      };

      for (let i = 0; i < clientsData.length; i++) {
        const clientData = clientsData[i];
        
        try {
          // Generate unique client ID if not provided
          const clientId = clientData.clientId || generateClientId();

          // Check if clientId already exists
          const existingClient = await prisma.client.findUnique({
            where: { clientId }
          });

          if (existingClient) {
            results.errors.push({
              row: i + 1,
              data: clientData,
              error: 'Client ID already exists'
            });
            continue;
          }

          // Validate and create client
          await this.createClient({
            ...clientData,
            clientId
          });

          results.success.push({
            row: i + 1,
            clientId,
            name: clientData.name
          });
        } catch (error: any) {
          results.errors.push({
            row: i + 1,
            data: clientData,
            error: error.message || 'Unknown error occurred'
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in bulk client creation:', error);
      throw error;
    }
  }
}