import { WebSocket } from 'ws';
import { createServer } from 'http';
import { app } from '../index';
import * as websocketService from '../services/websocket';

// Mock the websocket service
jest.mock('../services/websocket', () => ({
  wsService: {
    init: jest.fn(),
    broadcast: jest.fn(),
    sendToAgent: jest.fn(),
    getConnections: jest.fn(),
    disconnect: jest.fn(),
  },
}));

describe('WebSocket Service', () => {
  let server: any;
  let wsUrl: string;

  beforeAll((done) => {
    server = createServer(app);
    server.listen(0, () => {
      const address = server.address();
      wsUrl = `ws://localhost:${address.port}/ws`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize WebSocket service', () => {
    expect(websocketService.wsService.init).toHaveBeenCalled();
  });

  it('should handle WebSocket connection', (done) => {
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.close();
      done();
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  it('should handle WebSocket message', (done) => {
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'ping' }));
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'pong') {
        ws.close();
        done();
      }
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  it('should broadcast messages to all clients', () => {
    const mockMessage = { type: 'test', data: 'test data' };
    websocketService.wsService.broadcast(mockMessage);
    
    expect(websocketService.wsService.broadcast).toHaveBeenCalledWith(mockMessage);
  });

  it('should send messages to specific agent', () => {
    const mockAgentId = 'agent1';
    const mockMessage = { type: 'test', data: 'test data' };
    websocketService.wsService.sendToAgent(mockAgentId, mockMessage);
    
    expect(websocketService.wsService.sendToAgent).toHaveBeenCalledWith(mockAgentId, mockMessage);
  });

  it('should get active connections', () => {
    const mockConnections = [{ agentId: 'agent1', socket: {} }];
    (websocketService.wsService.getConnections as jest.Mock).mockReturnValue(mockConnections);
    
    const connections = websocketService.wsService.getConnections();
    expect(connections).toEqual(mockConnections);
    expect(websocketService.wsService.getConnections).toHaveBeenCalledTimes(1);
  });

  it('should handle client disconnection', () => {
    const mockAgentId = 'agent1';
    websocketService.wsService.disconnect(mockAgentId);
    
    expect(websocketService.wsService.disconnect).toHaveBeenCalledWith(mockAgentId);
  });
});