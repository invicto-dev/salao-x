import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FilterProps {
  element: React.ReactNode;
}

interface Props {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  filters?: FilterProps[];
  buttonsAfterFilters?: any[]; // Simplified for now
  children?: React.ReactNode;
  Error?: {
    isError: boolean;
    onClick: () => void;
  };
}

export default function PagesLayout({
  title,
  subtitle,
  filters,
  buttonsAfterFilters,
  children,
  Error,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        {title && (
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      {(filters || buttonsAfterFilters) && (
        <Card className="border-none shadow-sm bg-card/50 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              {filters && (
                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                  {filters.map((filter, index) => (
                    <React.Fragment key={index}>
                      {filter.element}
                    </React.Fragment>
                  ))}
                </div>
              )}
              {buttonsAfterFilters && (
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  {buttonsAfterFilters.map((button, index) => {
                    const { label, icon, ...rest } = button;
                    return (
                      <Button key={index} {...rest} className="hover:opacity-80 transition-all active:scale-95">
                        {icon}
                        {label}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardContent className="p-6">
          {Error && Error.isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription className="flex flex-col gap-4">
                Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.
                <Button variant="outline" size="sm" onClick={Error.onClick} className="w-fit">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </div>
  );
}
