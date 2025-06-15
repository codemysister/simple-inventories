<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Stock Movement Notification</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: {{ $stockMovement->type === 'inbound' ? '#28a745' : '#dc3545' }}; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .info-row { margin-bottom: 15px; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge-success { background-color: #d4edda; color: #155724; }
        .badge-danger { background-color: #f8d7da; color: #721c24; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>{{ $stockMovement->type === 'inbound' ? '📦 Stock Inbound' : '📤 Stock Outbound' }}</h2>
            <p>Stock Movement Notification</p>
        </div>
        
        <div class="content">
            <div class="info-row">
                <span class="label">Product:</span>
                <span class="value">{{ $product->name ?? 'N/A' }}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Type:</span>
                <span class="badge {{ $stockMovement->type === 'inbound' ? 'badge-success' : 'badge-danger' }}">
                    {{ ucfirst($stockMovement->type) }}
                </span>
            </div>
            
            <div class="info-row">
                <span class="label">Quantity:</span>
                <span class="value">{{ number_format($stockMovement->quantity) }}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Status:</span>
                <span class="value">{{ ucfirst($stockMovement->status ?? 'Waiting') }}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Created by:</span>
                <span class="value">{{ $user->name ?? 'System' }}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Date:</span>
                <span class="value">{{ $stockMovement->created_at->format('d M Y H:i:s') }}</span>
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated notification from {{ config('app.name') }}</p>
        </div>
    </div>
</body>
</html>