const mockPrisma = {
    candidate: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
    },
    education: {
        create: jest.fn(),
        update: jest.fn(),
    },
    workExperience: {
        create: jest.fn(),
        update: jest.fn(),
    },
    resume: {
        create: jest.fn(),
    },
};

jest.mock('@prisma/client', () => {
    class PrismaClientInitializationError extends Error {}

    return {
        PrismaClient: jest.fn(() => mockPrisma),
        Prisma: {
            PrismaClientInitializationError,
        },
    };
});

import { addCandidate } from '../application/services/candidateService';

const validCandidateData = {
    firstName: 'Laura',
    lastName: 'Torres',
    email: 'laura.torres@example.com',
    phone: '612345678',
    address: 'Calle Mayor 1',
};

describe('addCandidate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates a candidate when the required personal data is valid', async () => {
        const savedCandidate = {
            id: 42,
            ...validCandidateData,
        };
        mockPrisma.candidate.create.mockResolvedValue(savedCandidate);

        await expect(addCandidate(validCandidateData)).resolves.toEqual(savedCandidate);

        expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
            data: validCandidateData,
        });
    });

    it('rejects invalid candidate data before writing to the database', async () => {
        await expect(
            addCandidate({
                ...validCandidateData,
                email: 'invalid-email',
            }),
        ).rejects.toThrow('Invalid email');

        expect(mockPrisma.candidate.create).not.toHaveBeenCalled();
        expect(mockPrisma.education.create).not.toHaveBeenCalled();
        expect(mockPrisma.workExperience.create).not.toHaveBeenCalled();
        expect(mockPrisma.resume.create).not.toHaveBeenCalled();
    });

    it('stores candidate education, work experience, and CV after creating the candidate', async () => {
        const savedCandidate = {
            id: 73,
            ...validCandidateData,
        };
        mockPrisma.candidate.create.mockResolvedValue(savedCandidate);
        mockPrisma.education.create.mockResolvedValue({ id: 1 });
        mockPrisma.workExperience.create.mockResolvedValue({ id: 2 });
        mockPrisma.resume.create.mockResolvedValue({ id: 3 });

        await addCandidate({
            ...validCandidateData,
            educations: [
                {
                    institution: 'LIDR Academy',
                    title: 'AI4Devs',
                    startDate: '2026-02-01',
                    endDate: '2026-04-01',
                },
            ],
            workExperiences: [
                {
                    company: 'LTI',
                    position: 'Senior Developer',
                    description: 'Builds product features',
                    startDate: '2024-01-01',
                },
            ],
            cv: {
                filePath: '/uploads/cv-laura.pdf',
                fileType: 'application/pdf',
            },
        });

        expect(mockPrisma.education.create).toHaveBeenCalledWith({
            data: {
                institution: 'LIDR Academy',
                title: 'AI4Devs',
                startDate: new Date('2026-02-01'),
                endDate: new Date('2026-04-01'),
                candidateId: savedCandidate.id,
            },
        });
        expect(mockPrisma.workExperience.create).toHaveBeenCalledWith({
            data: {
                company: 'LTI',
                position: 'Senior Developer',
                description: 'Builds product features',
                startDate: new Date('2024-01-01'),
                endDate: undefined,
                candidateId: savedCandidate.id,
            },
        });
        expect(mockPrisma.resume.create).toHaveBeenCalledWith({
            data: {
                candidateId: savedCandidate.id,
                filePath: '/uploads/cv-laura.pdf',
                fileType: 'application/pdf',
                uploadDate: expect.any(Date),
            },
        });
    });

    it('returns a readable error when the candidate email already exists', async () => {
        mockPrisma.candidate.create.mockRejectedValue({
            code: 'P2002',
        });

        await expect(addCandidate(validCandidateData)).rejects.toThrow(
            'The email already exists in the database',
        );
    });
});
