// tests/GetEmissionsController.test.ts
import { Request, Response } from "express";
import { GetEmissionsController } from "../src/presentation/GetEmissionsController";
import { GetEmissionsUseCase } from "../src/application/GetEmissionsUseCase";
import { GetEmissionsError } from "../src/domain/errors/GetEmissionsError";
import { EmissionWithSector } from "../src/domain/EmissionWithSector";

// Mock the ResponseBuilder module
jest.mock("../src/presentation/responses/ResponseBuilder", () => ({
  ResponseBuilder: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Import the mocked ResponseBuilder
import { ResponseBuilder } from "../src/presentation/responses/ResponseBuilder";

// Mock dependencies
const mockUseCase: jest.Mocked<GetEmissionsUseCase> = {
  execute: jest.fn(),
} as any;

// Get the mocked ResponseBuilder
const mockResponseBuilder = ResponseBuilder as jest.Mocked<
  typeof ResponseBuilder
>;

describe("GetEmissionsController", () => {
  let controller: GetEmissionsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new GetEmissionsController(mockUseCase);

    mockRequest = {
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("handle", () => {
    it("should return success response when use case executes successfully", async () => {
      // Arrange
      const mockResult = {
        emissions: [new EmissionWithSector(2023, 100, "Energy", "USA", null)],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 1,
          totalPages: 1,
        },
      };

      const mockSuccessResponse = ResponseBuilder.success(mockResult);

      mockRequest.query = { page: "1", pageSize: "10" };
      mockUseCase.execute.mockResolvedValue(mockResult);
      mockResponseBuilder.success.mockReturnValue(mockSuccessResponse);

      // Act
      await controller.handle(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUseCase.execute).toHaveBeenCalledWith(mockRequest.query);
      expect(mockResponseBuilder.success).toHaveBeenCalledWith(mockResult);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSuccessResponse);
    });

    it("should return 400 error when GetEmissionsError is thrown", async () => {
      // Arrange
      const errorMessage = "Page must be greater than 0";
      const error = new GetEmissionsError(errorMessage);
      const mockErrorResponse = ResponseBuilder.error(errorMessage);

      mockUseCase.execute.mockRejectedValue(error);
      mockResponseBuilder.error.mockReturnValue(mockErrorResponse);

      // Act
      await controller.handle(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponseBuilder.error).toHaveBeenCalledWith(errorMessage);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(mockErrorResponse);
    });

    it("should return 500 error for unexpected errors", async () => {
      // Arrange
      const error = new Error("Database connection failed");
      const mockErrorResponse = ResponseBuilder.error(error.message);

      mockUseCase.execute.mockRejectedValue(error);
      mockResponseBuilder.error.mockReturnValue(mockErrorResponse);

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // Act
      await controller.handle(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error during get emissions operation:",
        error,
      );
      expect(mockResponseBuilder.error).toHaveBeenCalledWith(
        "Internal server error during get emissions operation.",
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(mockErrorResponse);

      // Cleanup
      consoleSpy.mockRestore();
    });

    it("should pass query parameters to use case", async () => {
      // Arrange
      const queryParams = {
        year: "2023",
        sectorCountry: "USA",
        page: "2",
        pageSize: "20",
        sortBy: "year",
        sortOrder: "desc",
      };

      mockRequest.query = queryParams;
      mockUseCase.execute.mockResolvedValue({
        emissions: [],
        pagination: { page: 2, pageSize: 20, total: 0, totalPages: 0 },
      });

      // Act
      await controller.handle(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUseCase.execute).toHaveBeenCalledWith(queryParams);
    });

    it("should handle empty query parameters", async () => {
      // Arrange
      mockRequest.query = {};
      mockUseCase.execute.mockResolvedValue({
        emissions: [],
        pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
      });

      // Act
      await controller.handle(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUseCase.execute).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
