/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ChevronDown, Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@plane/propel/button";
import { Combobox } from "@plane/propel/combobox";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { InstanceService } from "@plane/services";
import type { IFormattedInstanceConfiguration, TInstanceAIConfigurationKeys } from "@plane/types";
import { Input } from "@plane/ui";
import { cn } from "@plane/utils";
// components
import type { TControllerInputFormField } from "@/components/common/controller-input";
import { ControllerInput } from "@/components/common/controller-input";
// hooks
import { useInstance } from "@/hooks/store";

type IInstanceAIForm = {
  config: IFormattedInstanceConfiguration;
};

type AIFormValues = Record<TInstanceAIConfigurationKeys, string>;

export function InstanceAIForm(props: IInstanceAIForm) {
  const { config } = props;
  // store
  const { updateInstanceConfigurations } = useInstance();
  // service
  const instanceService = useMemo(() => new InstanceService(), []);
  // models state
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  // form data
  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<AIFormValues>({
    defaultValues: {
      LLM_API_KEY: config["LLM_API_KEY"],
      LLM_MODEL: config["LLM_MODEL"],
      LLM_BASE_URL: config["LLM_BASE_URL"],
    },
  });

  const baseUrlField: TControllerInputFormField = {
    key: "LLM_BASE_URL",
    type: "text",
    label: "Base URL",
    description: "The base URL for your LLM API. Leave empty for default OpenAI endpoint.",
    placeholder: "https://api.openai.com/v1",
    error: Boolean(errors.LLM_BASE_URL),
    required: false,
  };

  const apiKeyField: TControllerInputFormField = {
    key: "LLM_API_KEY",
    type: "password",
    label: "API key",
    description: "Your LLM provider API key.",
    placeholder: "sk-...",
    error: Boolean(errors.LLM_API_KEY),
    required: false,
  };

  const handleFetchModels = async () => {
    const currentKey = getValues("LLM_API_KEY");
    const currentUrl = getValues("LLM_BASE_URL");

    if (!currentKey) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error",
        message: "Please enter an API key first.",
      });
      return;
    }

    setIsFetchingModels(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const result: { models: string[] } = await instanceService.fetchAIModels({
        api_key: currentKey || undefined,
        base_url: currentUrl || undefined,
      });
      setAvailableModels(result.models);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Success",
        message: `${result.models.length} models loaded.`,
      });
    } catch (err: unknown) {
      const errorObj = err as { error?: string } | undefined;
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error",
        message: errorObj?.error || "Failed to fetch models. Check your API key and base URL.",
      });
    } finally {
      setIsFetchingModels(false);
    }
  };

  const onSubmit = async (formData: AIFormValues) => {
    const payload: Partial<AIFormValues> = { ...formData };

    await updateInstanceConfigurations(payload)
      .then(() =>
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success",
          message: "AI Settings updated successfully",
        })
      )
      .catch((err) => console.error(err));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div>
          <div className="pb-1 text-18 font-medium text-primary">AI / LLM</div>
          <div className="text-13 font-regular text-tertiary">
            Configure your LLM provider settings. Supports OpenAI-compatible APIs.
          </div>
        </div>

        <div className="grid w-full grid-cols-1 items-start gap-x-12 gap-y-8 lg:grid-cols-3">
          {/* Base URL */}
          <ControllerInput
            control={control}
            type={baseUrlField.type}
            name={baseUrlField.key}
            label={baseUrlField.label}
            description={baseUrlField.description}
            placeholder={baseUrlField.placeholder}
            error={baseUrlField.error}
            required={baseUrlField.required}
          />

          {/* API Key */}
          <ControllerInput
            control={control}
            type={apiKeyField.type}
            name={apiKeyField.key}
            label={apiKeyField.label}
            description={apiKeyField.description}
            placeholder={apiKeyField.placeholder}
            error={apiKeyField.error}
            required={apiKeyField.required}
          />

          {/* Model Selection */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h4 className="text-13 text-tertiary">LLM Model</h4>
              <button
                type="button"
                onClick={() => void handleFetchModels()}
                disabled={isFetchingModels}
                className="flex items-center gap-1 text-11 text-accent-primary hover:underline disabled:opacity-50"
              >
                {isFetchingModels ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
                {isFetchingModels ? "Loading..." : "Fetch Models"}
              </button>
            </div>

            <Controller
              control={control}
              name="LLM_MODEL"
              render={({ field: { value, onChange, ref } }) =>
                availableModels.length > 0 ? (
                  <Combobox value={value} onValueChange={(v) => onChange(v as string)}>
                    <Combobox.Button
                      ref={ref}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md border border-subtle bg-surface-1 px-3 py-2 text-13 text-primary",
                        "hover:bg-surface-2 focus:outline-none",
                        errors.LLM_MODEL && "border-danger-primary"
                      )}
                    >
                      <span className={cn(!value && "text-placeholder")}>{value || "Select a model..."}</span>
                      <ChevronDown className="size-3.5 text-tertiary" />
                    </Combobox.Button>
                    <Combobox.Options
                      showSearch
                      searchPlaceholder="Search models..."
                      emptyMessage="No models match your search."
                      className="w-[var(--anchor-width)]"
                    >
                      {availableModels.map((model) => (
                        <Combobox.Option key={model} value={model}>
                          {model}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  </Combobox>
                ) : (
                  <Input
                    id="LLM_MODEL"
                    name="LLM_MODEL"
                    type="text"
                    value={value}
                    onChange={onChange}
                    ref={ref}
                    hasError={Boolean(errors.LLM_MODEL)}
                    placeholder="gpt-4o-mini"
                    className="w-full rounded-md font-medium"
                  />
                )
              }
            />
            <p className="pt-0.5 text-11 text-tertiary">
              {availableModels.length > 0
                ? "Select the model to use for AI features."
                : 'Enter your API key and click "Fetch Models" to load available models, or type a model name manually.'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 items-start">
        <Button variant="primary" size="lg" onClick={() => void handleSubmit(onSubmit)()} loading={isSubmitting}>
          {isSubmitting ? "Saving" : "Save changes"}
        </Button>

        <div className="relative inline-flex items-center gap-1.5 rounded-sm border border-accent-subtle bg-accent-subtle px-4 py-2 text-caption-sm-regular text-accent-secondary  ">
          <Lightbulb className="size-4" />
          <div>
            If you have a preferred AI models vendor, please get in{" "}
            <a className="underline font-medium" href="https://plane.so/contact">
              touch with us.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
