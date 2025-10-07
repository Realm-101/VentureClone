import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ExportCompletePlanProps {
  analysisId: string;
  businessName: string;
}

export function ExportCompletePlan({ analysisId, businessName }: ExportCompletePlanProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'pdf' | 'html' | 'json') => {
    setIsExporting(true);
    
    try {
      const response = await fetch(`/api/business-analyses/${analysisId}/export-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Set filename based on format
      const extension = format === 'pdf' ? 'pdf' : format === 'html' ? 'html' : 'json';
      a.download = `${businessName.replace(/[^a-z0-9]/gi, '-')}-Complete-Plan.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `Complete business plan exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export complete plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isExporting}
          className="bg-gradient-to-r from-vc-primary to-vc-accent hover:from-vc-primary/80 hover:to-vc-accent/80 text-white font-semibold shadow-neon px-8"
          data-testid="button-export-complete-plan"
        >
          <Download className="mr-2 h-5 w-5" />
          {isExporting ? 'Exporting...' : 'Export Complete Plan'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-vc-card border-vc-border">
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="text-vc-text hover:bg-vc-dark cursor-pointer"
        >
          <Download className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('html')}
          disabled={isExporting}
          className="text-vc-text hover:bg-vc-dark cursor-pointer"
        >
          <Download className="mr-2 h-4 w-4" />
          Export as HTML
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className="text-vc-text hover:bg-vc-dark cursor-pointer"
        >
          <Download className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
