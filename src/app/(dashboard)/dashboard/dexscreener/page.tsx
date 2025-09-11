export default function PumpChartTabs() {
    const token = "DdXuAoKbi7pWmpJfDLFWF2oQ1oaa3SyQm3yGm18fpump";
  
    return (
      <div className="grid grid-cols-1 gap-4">
        {/* Chart only */}
        <iframe
          src={`https://dexscreener.com/solana/${token}?embed=1&theme=dark&trades=0&info=0`}
          width="100%"
          height="500"
          style={{ border: 0 }}
        />
  
        {/* Trades only */}
        <iframe
          src={`https://dexscreener.com/solana/${token}?embed=1&theme=dark&chart=0&info=0`}
          width="100%"
          height="300"
          style={{ border: 0 }}
        />
  
        {/* Info only */}
        <iframe
          src={`https://dexscreener.com/solana/${token}?embed=1&theme=dark&chart=0&trades=0`}
          width="100%"
          height="300"
          style={{ border: 0 }}
        />
      </div>
    );
  }
  