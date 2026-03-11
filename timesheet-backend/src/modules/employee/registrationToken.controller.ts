import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { isTokenExpired } from "../../utils/registrationToken";

export const validateRegistrationToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Find the registration token
    const registrationToken = await prisma.registrationToken.findUnique({
      where: { token: token as string },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            officeEmail: true,
            designation: true,
            department: true,
            role: true,
            status: true,
            reportingManager: true,
            reportingPartner: true,
          }
        }
      }
    });

    if (!registrationToken) {
      return res.status(404).json({ error: 'Registration link invalid or expired' });
    }

    // Check if token is already used
    if (registrationToken.isUsed) {
      return res.status(400).json({ error: 'Registration link has already been used' });
    }

    // Check if token is expired
    if (isTokenExpired(registrationToken.expiresAt)) {
      return res.status(400).json({ error: 'Registration link has expired' });
    }

    // Token is valid, return employee information
    res.json({
      employee: registrationToken.employee,
      token: registrationToken.token
    });

  } catch (error) {
    console.error('Error validating registration token:', error);
    res.status(500).json({ error: 'Failed to validate registration token' });
  }
};

export const markTokenAsUsed = async (token: string): Promise<void> => {
  try {
    await prisma.registrationToken.update({
      where: { token },
      data: { isUsed: true }
    });
  } catch (error) {
    console.error('Error marking token as used:', error);
    throw error;
  }
};
