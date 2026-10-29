<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuoteClassificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'text' => ['nullable', 'string', 'min:3', 'max:155'],
            'hasDrawing' => ['required', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (
                ! $validator->errors()->any() &&
                blank($this->input('text')) &&
                ! $this->boolean('hasDrawing')
            ) {
                $validator->errors()->add('text', 'Add text or a drawing before publishing.');
            }
        });
    }
}
