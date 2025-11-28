import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Heart, Baby, Droplet, Bone, Brain, Stethoscope } from 'lucide-react';

interface SpecializationSelectorProps {
    onSelect: (specialization: string) => void;
    selectedSpecialization?: string;
}

const specializationIcons: Record<string, any> = {
    'Cardiology': Heart,
    'Pediatrics': Baby,
    'Dermatology': Droplet,
    'Orthopedics': Bone,
    'Neurology': Brain,
    'General Medicine': Stethoscope,
};

export function SpecializationSelector({ onSelect, selectedSpecialization }: SpecializationSelectorProps) {
    const specializations = [
        {
            name: 'Cardiology',
            description: 'Heart and cardiovascular system',
            symptoms: ['Chest pain', 'Heart palpitations', 'High blood pressure'],
            color: 'from-red-500 to-pink-600'
        },
        {
            name: 'Pediatrics',
            description: "Children's health and development",
            symptoms: ['Fever', 'Vaccination', 'Growth concerns'],
            color: 'from-blue-500 to-cyan-600'
        },
        {
            name: 'Dermatology',
            description: 'Skin, hair, and nail conditions',
            symptoms: ['Rash', 'Acne', 'Skin irritation'],
            color: 'from-amber-500 to-orange-600'
        },
        {
            name: 'Orthopedics',
            description: 'Bones, joints, and muscles',
            symptoms: ['Joint pain', 'Fracture', 'Back pain'],
            color: 'from-green-500 to-emerald-600'
        },
        {
            name: 'Neurology',
            description: 'Brain and nervous system',
            symptoms: ['Headache', 'Dizziness', 'Memory problems'],
            color: 'from-purple-500 to-violet-600'
        },
        {
            name: 'General Medicine',
            description: 'General health and wellness',
            symptoms: ['Fever', 'Cold', 'General checkup'],
            color: 'from-indigo-500 to-blue-600'
        },
    ];

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">Select Medical Specialization</h3>
                <p className="text-sm text-muted-foreground">
                    Choose the area that best matches your medical concern
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specializations.map((spec) => {
                    const Icon = specializationIcons[spec.name] || Stethoscope;
                    const isSelected = selectedSpecialization === spec.name;

                    return (
                        <Card
                            key={spec.name}
                            className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-600 shadow-lg' : 'hover:scale-105'
                                }`}
                            onClick={() => onSelect(spec.name)}
                        >
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    {/* Icon and Title */}
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-lg bg-gradient-to-br ${spec.color}`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{spec.name}</h4>
                                            {isSelected && (
                                                <Badge className="mt-1 bg-blue-600">Selected</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-muted-foreground">
                                        {spec.description}
                                    </p>

                                    {/* Common Symptoms */}
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                            Common concerns:
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {spec.symptoms.map((symptom) => (
                                                <Badge
                                                    key={symptom}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {symptom}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
